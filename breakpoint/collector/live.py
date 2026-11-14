"""Live stage transcription helpers (standard library only; mlx_whisper is imported lazily).

Used by collect.py for the Breakpoint stage streams:
- YouTube video IDs from desk embed URLs or test URLs, and yt-dlp audio URL resolution
- session assignment from the published schedule (Europe/London)
- the speech-recognition glossary, silence detection and junk-line filtering
- model calls (Anthropic, Z.ai GLM or OpenAI) with one retry, a fallback provider and a cost log
- excerpt matching against the transcript and title dedupe for model output

Rules: secrets and resolved stream URLs (they carry signed parameters) are never logged.
Model output and transcripts are untrusted data.
"""
import array, csv, datetime as dt, json, math, os, re, shutil, string, subprocess, sys, threading, time, urllib.error, urllib.parse, urllib.request, wave
from zoneinfo import ZoneInfo

LONDON = ZoneInfo('Europe/London')
UTC = dt.timezone.utc
VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{11}$')
YOUTUBE_HOSTS = {'www.youtube.com', 'youtube.com', 'm.youtube.com', 'music.youtube.com'}
EMBED_HOSTS = {'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'}
ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
ZAI_CHAT_URL = 'https://api.z.ai/api/paas/v4/chat/completions'
ZAI_ASR_URL = 'https://api.z.ai/api/paas/v4/audio/transcriptions'
OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
OPENAI_ASR_URL = 'https://api.openai.com/v1/audio/transcriptions'
KEY_ENV = {'anthropic': 'ANTHROPIC_API_KEY', 'zai': 'ZAI_API_KEY', 'openai': 'OPENAI_API_KEY'}
LLM_PROVIDERS = ('anthropic', 'zai', 'openai', 'none')
ASR_PROVIDERS = ('mlx', 'zai', 'openai')
TRANSCRIBE_LOCK = threading.Lock()  # one chunk at a time across stages (one GPU)
BASE_TERMS = ['Solana', 'Breakpoint', 'Anza', 'Agave', 'Firedancer', 'Alpenglow', 'Jupiter', 'JUP', 'Jito', 'JTO', 'Kamino', 'KMNO',
              'Meteora', 'MET', 'Helius', 'Phantom', 'Backpack', 'Solflare', 'Squads', 'Pyth', 'Sanctum', 'stablecoin', 'tokenization',
              'RWA', 'DePIN', 'validator', 'SOL']
JUNK = ('thank you for watching', 'thanks for watching', 'thank you so much for watching', 'subtitles by', 'please subscribe',
        'like and subscribe', 'subscribe to my channel', 'subscribe to the channel', 'amara.org', 'transcribed by', 'captions by',
        'see you in the next video', 'see you next time')
QUOTES = {'‘': "'", '’': "'", '‚': "'", '‛': "'", '′': "'", '“': '"', '”': '"', '„': '"',
          '‟': '"', '″': '"', '–': '-', '—': '-', '−': '-', ' ': ' '}
EDGE = string.punctuation + string.whitespace + '…'


class LiveError(Exception):
    pass


class ProviderError(Exception):
    """A model or speech provider call failed. retryable: timeout, network, 408, 429 or 5xx."""
    def __init__(self, message, status=None, retryable=False):
        super().__init__(message)
        self.status = status
        self.retryable = retryable


def redact(text):
    text = re.sub(r'https?://\S+', '<url>', str(text or ''))
    return re.sub(r'(?i)\b(sk-[\w-]{6,}|[a-f0-9]{32,}|bearer\s+\S+)', '<redacted>', text)


# ---------- YouTube ----------

def video_id_from_embed(url):
    """Video ID from a desk embed URL (https://www.youtube.com/embed/<id> or youtube-nocookie.com); None for anything else."""
    try:
        u = urllib.parse.urlparse(str(url or ''))
    except ValueError:
        return None
    if u.scheme != 'https' or u.hostname not in EMBED_HOSTS or u.username or u.password:
        return None
    m = re.fullmatch(r'/embed/([A-Za-z0-9_-]{11})/?', u.path)
    return m.group(1) if m else None


def video_id_from_url(url):
    """Video ID from a YouTube page URL (watch?v=, /live/<id>, youtu.be/<id>, /embed/<id>); None for anything else."""
    try:
        u = urllib.parse.urlparse(str(url or '').strip())
    except ValueError:
        return None
    if u.scheme not in ('https', 'http') or u.username or u.password:
        return None
    if u.hostname == 'youtu.be':
        m = re.fullmatch(r'/([A-Za-z0-9_-]{11})/?', u.path)
        return m.group(1) if m else None
    if u.hostname in YOUTUBE_HOSTS or u.hostname in EMBED_HOSTS:
        if u.path in ('/watch', '/watch/'):
            v = urllib.parse.parse_qs(u.query).get('v', [''])[0]
            return v if VIDEO_ID.fullmatch(v) else None
        m = re.fullmatch(r'/(?:live|embed|shorts)/([A-Za-z0-9_-]{11})/?', u.path)
        return m.group(1) if m else None
    return None


def watch_url(video_id):
    return 'https://www.youtube.com/watch?v=' + video_id


def ytdlp_path():
    local = os.path.join(os.path.dirname(sys.executable), 'yt-dlp')
    return local if os.access(local, os.X_OK) else shutil.which('yt-dlp')


def resolve_audio(video_id, fmt, timeout=60, run=subprocess.run):
    """(audio_url, format_id, is_live) for a YouTube video; is_live is True, False or None (unknown).
    The URL is signed: never log it."""
    exe = ytdlp_path()
    if not exe:
        raise LiveError('yt-dlp is not installed (breakpoint/.venv/bin/yt-dlp)')
    cmd = [exe, '--no-warnings', '-f', fmt, '--print', 'live=%(is_live)s', '--print', 'format=%(format_id)s', '--print', 'urls', watch_url(video_id)]
    try:
        r = run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise LiveError('yt-dlp timed out') from None
    if r.returncode != 0:
        lines = [x for x in (r.stderr or '').splitlines() if x.strip()]
        raise LiveError('yt-dlp failed: ' + redact(lines[-1] if lines else 'no detail')[:240])
    lines = [x.strip() for x in (r.stdout or '').splitlines() if x.strip()]
    urls = [x for x in lines if x.startswith('https://')]
    if not urls:
        raise LiveError('yt-dlp returned no https stream URL')
    live_flag = next((x[5:] for x in lines if x.startswith('live=')), 'NA')
    fmt_id = next((x[7:] for x in lines if x.startswith('format=')), '?')
    return urls[0], fmt_id[:40], {'True': True, 'False': False}.get(live_flag)


# ---------- Schedule ----------

def session_window(s, offset_minutes=0):
    d = dt.date.fromisoformat(s['date'])
    h, m = (int(x) for x in s['time'].split(':'))
    start = dt.datetime(d.year, d.month, d.day, h, m, tzinfo=LONDON).astimezone(UTC) + dt.timedelta(minutes=float(offset_minutes or 0))
    return start, start + dt.timedelta(minutes=int(s.get('durationMinutes') or 0))


def session_info(s, start=None, end=None):
    speakers = list(s.get('speakerNames') or [p.get('name') for p in s.get('speakers') or [] if p.get('name')])
    orgs = []
    for p in s.get('speakers') or []:
        if p.get('project') and p['project'] not in orgs:
            orgs.append(p['project'])
    info = {'id': s['id'], 'title': str(s.get('title') or '')[:200], 'speakers': speakers[:12], 'organisations': orgs[:12],
            'scheduled': f"{s.get('date', '')} {s.get('time', '')} London".strip()}
    if start:
        info['start'], info['end'] = start, end
    return info


def pick_session(sessions, stage_name, now, offset_minutes=0, lead=60, tail=120):
    """(active, upcoming) for one stage at `now` (aware datetime).

    Candidates: sessions on this stage with dateVerified true. A session is active from start - lead seconds
    until end + tail seconds, after shifting by offset_minutes; if several are active the latest start wins.
    upcoming is the next session that has not opened yet. Both are session_info dicts (with start/end) or None.
    """
    active = upcoming = None
    lead, tail = dt.timedelta(seconds=lead), dt.timedelta(seconds=tail)
    for s in sessions or []:
        if not isinstance(s, dict) or s.get('stage') != stage_name or s.get('dateVerified') is not True:
            continue
        try:
            start, end = session_window(s, offset_minutes)
        except (KeyError, ValueError, TypeError, AttributeError):
            continue
        if start - lead <= now <= end + tail:
            if active is None or start > active['start']:
                active = session_info(s, start, end)
        elif start - lead > now and (upcoming is None or start < upcoming['start']):
            upcoming = session_info(s, start, end)
    return active, upcoming


def public_session(info):
    """JSON-safe copy of a session_info dict (no datetimes)."""
    return {k: (v.isoformat() if isinstance(v, dt.datetime) else v) for k, v in (info or {}).items()}


# ---------- Speech ----------

def glossary(session, projects, limit=600):
    """initial_prompt for Whisper: this talk's speakers and organisations, then Solana terms (about 150 to 200 tokens)."""
    terms = []
    for t in list((session or {}).get('speakers') or []) + list((session or {}).get('organisations') or []) + BASE_TERMS + \
            [p.get('name') for p in projects] + [p.get('symbol') for p in projects]:
        t = re.sub(r'\s+', ' ', str(t or '')).strip()
        if t and t not in terms:
            terms.append(t)
    out = ''
    for t in terms:
        nxt = out + ', ' + t if out else t
        if len(nxt) > limit:
            break
        out = nxt
    return out + '.'


def wav_rms(path):
    """RMS level of a 16-bit WAV (0 to 32767). audioop is gone in Python 3.13, so this uses array('h')."""
    with wave.open(str(path)) as w:
        if w.getsampwidth() != 2:
            return None
        frames = w.readframes(w.getnframes())
    a = array.array('h')
    a.frombytes(frames[:len(frames) // 2 * 2])
    if sys.byteorder == 'big':
        a.byteswap()
    if not a:
        return 0.0
    return math.sqrt(sum(x * x for x in a) / len(a))


def _words(text):
    return re.findall(r"[a-z0-9']+", str(text).lower())


def clean_segments(segments, prompt='', no_speech=0.6):
    """Speech segments minus Whisper junk: likely silence, known hallucinations, prompt echoes and repeated short lines."""
    prompt_words = set(_words(prompt))
    out, last = [], None
    for seg in segments or []:
        text = re.sub(r'\s+', ' ', str(seg.get('text') or '')).strip()
        if not text or not re.search(r'[A-Za-z0-9]', text):
            continue
        try:
            if float(seg.get('no_speech_prob') or 0) > no_speech:
                continue
        except (TypeError, ValueError):
            pass
        words = _words(text)
        low = ' '.join(words)
        if len(words) <= 14 and any(j in low for j in JUNK):
            continue
        if len(words) >= 4 and prompt_words and all(w in prompt_words for w in words):
            continue  # the glossary read back on silence
        if low == last and len(words) <= 8:
            continue  # the same short line repeated
        last = low
        out.append(text)
    return out


def clean_text(text, prompt=''):
    """clean_segments for providers that return plain text (sentence by sentence)."""
    parts = re.split(r'(?<=[.!?])\s+', re.sub(r'\s+', ' ', str(text or '')).strip())
    return ' '.join(clean_segments([{'text': p} for p in parts], prompt))


def enough_words(text, minimum=3):
    return len(_words(text)) >= minimum


def transcribe_mlx(path, model, prompt):
    import mlx_whisper  # lazy: only the Mac Mini venv has it
    with TRANSCRIBE_LOCK:
        result = mlx_whisper.transcribe(str(path), path_or_hf_repo=model, language='en', initial_prompt=prompt,
                                        condition_on_previous_text=False, temperature=0.0, verbose=None)
    return ' '.join(clean_segments(result.get('segments') or [{'text': result.get('text', '')}], prompt))


def multipart(fields, audio, filename='chunk.wav'):
    boundary = 'breakpoint-' + os.urandom(12).hex()
    body = b''
    for name, value in fields.items():
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: audio/wav\r\n\r\n'.encode()
    return body + audio + f'\r\n--{boundary}--\r\n'.encode(), boundary


def transcribe_remote(path, provider, key, model, prompt, opener):
    audio = pathlib_bytes(path)
    if len(audio) > 24_000_000:
        raise LiveError('Audio chunk exceeds the provider limit')
    if provider == 'zai':
        url, fields = ZAI_ASR_URL, {'model': model or 'glm-asr-2512'}
    else:
        url, fields = OPENAI_ASR_URL, {'model': model or 'gpt-4o-mini-transcribe', 'response_format': 'json', 'prompt': prompt}
    body, boundary = multipart(fields, audio)
    req = urllib.request.Request(url, data=body, method='POST',
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'multipart/form-data; boundary=' + boundary})
    try:
        with opener.open(req, timeout=90) as r:
            result = json.loads(r.read(1_000_000))
    except urllib.error.HTTPError as e:
        raise LiveError(f'Transcription failed: HTTP {e.code}') from None
    except (urllib.error.URLError, OSError, ValueError):
        raise LiveError('Transcription failed (network or response)') from None
    text = result.get('text') if isinstance(result, dict) else None
    if not isinstance(text, str):
        raise LiveError('Transcription response has no text')
    return clean_text(text, prompt)


def pathlib_bytes(path):
    with open(path, 'rb') as f:
        return f.read()


# ---------- Model output checks ----------

def _norm_map(text):
    """Normalised text (lowercase, straight quotes, single spaces) plus each character's index in the original."""
    out, idx, space = [], [], True
    for i, ch in enumerate(str(text)):
        ch = QUOTES.get(ch, ch)
        low = ch.lower()
        ch = low if len(low) == 1 else ch
        if ch.isspace():
            if not space:
                out.append(' ')
                idx.append(i)
            space = True
        else:
            out.append(ch)
            idx.append(i)
            space = False
    return ''.join(out), idx


def normalise(text):
    return _norm_map(text)[0].strip(EDGE)


def find_excerpt(excerpt, transcript):
    """The original transcript substring an excerpt points to, after normalising both sides; None if absent."""
    needle = normalise(excerpt)
    if not needle:
        return None
    hay, idx = _norm_map(transcript)
    pos = hay.find(needle)
    if pos < 0:
        return None
    return str(transcript)[idx[pos]:idx[pos + len(needle) - 1] + 1]


def title_words(title):
    return {w for w in re.findall(r'[a-z0-9]+', normalise(title)) if len(w) >= 4}


def similar_title(title, earlier, threshold=0.6):
    """True when a title overlaps an earlier one (Jaccard on lowercase words of 4+ letters) by threshold or more."""
    a = title_words(title)
    for other in earlier or []:
        b = title_words(other)
        if not a and not b:
            if normalise(title) == normalise(other):
                return True
            continue
        if a and b and len(a & b) / len(a | b) >= threshold:
            return True
    return False


def json_from_text(content):
    """The JSON object in a chat completion's text, tolerating code fences and text around it."""
    content = str(content or '')
    start, end = content.find('{'), content.rfind('}')
    if start < 0 or end < start:
        raise ProviderError('Model response is not JSON')
    try:
        value = json.loads(content[start:end + 1])
    except ValueError:
        raise ProviderError('Model response is not JSON') from None
    if not isinstance(value, dict):
        raise ProviderError('Model response is not a JSON object')
    return value


# ---------- Model providers ----------

STRICT_DROP = ('maxLength', 'minLength', 'maxItems', 'minItems', 'minimum', 'maximum')
# Models that reject a forced tool call (HTTP 400 "tool_choice: type tool and any are not supported").
# Others are learned at run time from that error.
AUTO_TOOL_MODELS = {'claude-sonnet-5-5'}


def strict_schema(schema):
    """A JSON Schema for strict tool use: limits moved into descriptions, additionalProperties false on objects."""
    if isinstance(schema, list):
        return [strict_schema(x) for x in schema]
    if not isinstance(schema, dict):
        return schema
    out, limits = {}, []
    for k, v in schema.items():
        if k in STRICT_DROP:
            limits.append({'maxLength': f'at most {v} characters', 'minLength': f'at least {v} characters', 'maxItems': f'at most {v} items',
                           'minItems': f'at least {v} items', 'minimum': f'minimum {v}', 'maximum': f'maximum {v}'}[k])
        elif k in ('properties',):
            out[k] = {name: strict_schema(sub) for name, sub in v.items()}
        else:
            out[k] = strict_schema(v)
    if limits:
        out['description'] = (out.get('description', '') + ' (' + ', '.join(limits) + ')').strip()
    if out.get('type') == 'object':
        out['additionalProperties'] = False
    return out


def anthropic_tool_body(model, system, user, tool, description, schema, max_tokens, forced=True):
    """Messages API body that makes Claude answer through one tool call.

    forced: tool_choice names the tool (no thinking). Otherwise (models that reject forcing, e.g. Sonnet 5.5):
    tool_choice auto, strict schema, the lowest thinking setting, room for it in max_tokens, and the prompt says
    to always call the tool. No temperature/top_p/top_k: Claude 5.5 models reject them."""
    body = {'model': model, 'max_tokens': max_tokens,
            'system': [{'type': 'text', 'text': system, 'cache_control': {'type': 'ephemeral'}}],
            'messages': [{'role': 'user', 'content': user}]}
    if forced:
        body['tools'] = [{'name': tool, 'description': description, 'input_schema': schema}]
        body['tool_choice'] = {'type': 'tool', 'name': tool}
    else:
        body['system'][0]['text'] = system + f'\n\nAlways reply by calling the {tool} tool exactly once, even when there is nothing to report.'
        body['tools'] = [{'name': tool, 'description': description, 'input_schema': strict_schema(schema), 'strict': True}]
        body['tool_choice'] = {'type': 'auto'}
        body['thinking'] = {'type': 'between_tools'}
        body['output_config'] = {'effort': 'low'}
        body['max_tokens'] = max(max_tokens, 4000)
    return body


def rejects_forced_tool(error):
    return isinstance(error, ProviderError) and error.status == 400 and 'tool_choice' in str(error)



def parse_anthropic(response, tool='publish_entries', key='entries'):
    """(tool input, usage) from a forced tool call. Tolerates the list arriving as a JSON string or under another
    single key; failures name the stop reason and the input's field types (never content)."""
    stop = response.get('stop_reason') if isinstance(response, dict) else None
    blocks = response.get('content') if isinstance(response, dict) else None
    block = next((b for b in blocks or [] if isinstance(b, dict) and b.get('type') == 'tool_use' and b.get('name') == tool), None)
    if not block or not isinstance(block.get('input'), dict):
        kinds = ', '.join(str(b.get('type')) for b in blocks or [] if isinstance(b, dict)) or 'none'
        raise ProviderError(f'Anthropic response has no {tool} call (stop_reason {stop}; content blocks: {kinds})')
    data = dict(block['input'])
    value = data.get(key)
    if isinstance(value, str):
        try:
            data[key] = json.loads(value)
        except ValueError:
            pass
    elif value is None:
        lists = [v for v in data.values() if isinstance(v, list)]
        if len(lists) == 1:
            data[key] = lists[0]
    if not isinstance(data.get(key), list):
        shape = ', '.join(f'{k}: {type(v).__name__}' for k, v in list(data.items())[:6]) or 'empty'
        raise ProviderError(f'Anthropic {tool} call has no {key} list (stop_reason {stop}; tool input {shape})')
    u = response.get('usage') or {}
    usage = {'input': int(u.get('input_tokens') or 0), 'cacheRead': int(u.get('cache_read_input_tokens') or 0),
             'cacheWrite': int(u.get('cache_creation_input_tokens') or 0), 'output': int(u.get('output_tokens') or 0)}
    return data, usage


def parse_chat(response):
    try:
        content = response['choices'][0]['message'].get('content')
    except (KeyError, IndexError, TypeError, AttributeError):
        raise ProviderError('Response is not a chat completion') from None
    result = json_from_text(content)
    u = response.get('usage') or {}
    prompt = int(u.get('prompt_tokens') or 0)
    cached = int(((u.get('prompt_tokens_details') or {}).get('cached_tokens')) or 0)
    return result, {'input': max(prompt - cached, 0), 'cacheRead': cached, 'cacheWrite': 0, 'output': int(u.get('completion_tokens') or 0)}


def cost_usd(usage, price):
    price = price or {}
    base = float(price.get('in', 0))
    return (usage.get('input', 0) * base + usage.get('cacheRead', 0) * float(price.get('cacheRead', base)) +
            usage.get('cacheWrite', 0) * float(price.get('cacheWrite', base)) + usage.get('output', 0) * float(price.get('out', 0))) / 1e6


def estimate_usd(text, max_tokens, price):
    """Conservative cost of one call: about 3 characters per input token, the full output allowance."""
    price = price or {}
    return (len(text) / 3 + 2500) * float(price.get('in', 0)) / 1e6 + max_tokens * float(price.get('out', 0)) / 1e6


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


OPENER = urllib.request.build_opener(NoRedirect())


def post_json(url, body, headers, timeout=90, opener=OPENER):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='POST',
                                 headers={'User-Agent': 'SebMonty-BreakpointLive/1.0', 'Accept': 'application/json',
                                          'Content-Type': 'application/json', **headers})
    try:
        with opener.open(req, timeout=timeout) as r:
            raw = r.read(4_000_001)
    except urllib.error.HTTPError as e:
        detail = ''
        try:
            err = json.loads(e.read(4000) or b'{}').get('error') or {}
            if isinstance(err, dict):
                detail = ' ' + redact(' '.join(str(err.get(k)) for k in ('type', 'code', 'message') if err.get(k)))[:200]
        except (ValueError, OSError, AttributeError):
            pass
        raise ProviderError(f'HTTP {e.code}{detail}', e.code, e.code in (408, 409, 429) or e.code >= 500) from None
    except (urllib.error.URLError, OSError, ValueError):
        raise ProviderError('Network error or timeout', None, True) from None
    if len(raw) > 4_000_000:
        raise ProviderError('Response too large')
    try:
        return json.loads(raw)
    except ValueError:
        raise ProviderError('Response is not JSON') from None


class LLM:
    """call() sends one request to llm.provider, retries once after 5 s on timeout, 429 or 5xx,
    then uses llm.fallback for that call. Every call is reserved against the daily budget first,
    settled to its real cost after, and written to <state>/costs.csv."""

    def __init__(self, desk, keys, log=print, post=post_json, sleep=time.sleep):
        self.desk, self.keys, self.log, self.post, self.sleep = desk, keys, log, post, sleep
        self.csv_lock = threading.Lock()

    @property
    def spec(self):
        return llm_spec(self.desk.config)

    def enabled(self):
        return self.spec['provider'] != 'none'

    def price(self, model):
        return (self.spec.get('prices') or {}).get(model) or {}

    def call(self, system, payload_text, schema, *, stage, session, max_tokens=1500, reserve_usd=0.02):
        spec = self.spec
        primary = {'provider': spec['provider'], 'model': spec.get('model')}
        attempts = [primary, primary]
        fb = spec.get('fallback')
        if fb and fb.get('provider') in KEY_ENV and self.keys.get(KEY_ENV[fb['provider']]):
            attempts.append({'provider': fb['provider'], 'model': fb.get('model')})
        last = None
        for i, target in enumerate(attempts):
            if i == 1:
                self.sleep(5)
            elif i == 2:
                self.log(f'{stage}: {primary["provider"]} failed twice ({last}); using {target["provider"]} {target["model"]} for this call')
            try:
                return self._once(target, system, payload_text, schema, stage, session, max_tokens, reserve_usd)
            except ProviderError as e:
                last = e
                if not e.retryable:
                    if e.status == 404 and target['provider'] == 'anthropic':
                        self.log(f'Anthropic returned 404 for model {target["model"]}: check the model ID in the models overview on docs.claude.com')
                    raise
        raise last

    def _once(self, target, system, payload_text, schema, stage, session, max_tokens, reserve_usd):
        provider, model = target['provider'], target['model']
        key = self.keys.get(KEY_ENV.get(provider, ''), '')
        if not key:
            raise ProviderError(f'{KEY_ENV.get(provider, provider)} is missing')
        reserve = max(float(reserve_usd), estimate_usd(payload_text + system, max_tokens, self.price(model)))
        self.desk.state.reserve(reserve, 'llm')
        if provider == 'anthropic':
            headers = {'x-api-key': key, 'anthropic-version': '2023-06-01'}
            description = 'Publish the factual entries found in the transcript (an empty list when there are none).'
            forced = model not in AUTO_TOOL_MODELS
            try:
                response = self.post(ANTHROPIC_URL, anthropic_tool_body(model, system, payload_text, 'publish_entries', description, schema, max_tokens, forced), headers)
            except ProviderError as e:
                if not (forced and rejects_forced_tool(e)):
                    raise
                AUTO_TOOL_MODELS.add(model)
                self.log(f'{model} does not accept a forced tool call; using tool_choice auto with a strict schema from now on')
                response = self.post(ANTHROPIC_URL, anthropic_tool_body(model, system, payload_text, 'publish_entries', description, schema, max_tokens, False), headers)
            result, usage = parse_anthropic(response)
        else:
            url = ZAI_CHAT_URL if provider == 'zai' else OPENAI_CHAT_URL
            body = {'model': model, 'max_tokens': max_tokens, 'temperature': 0, 'response_format': {'type': 'json_object'},
                    'messages': [{'role': 'system', 'content': system + '\n\nReturn only a JSON object matching this JSON Schema:\n' + json.dumps(schema)},
                                 {'role': 'user', 'content': payload_text}]}
            if provider == 'zai':
                body['thinking'] = {'type': 'disabled'}
            result, usage = parse_chat(self.post(url, body, {'Authorization': 'Bearer ' + key}))
        usd = cost_usd(usage, self.price(model))
        today = self.desk.state.settle(reserve, usd)
        self.record(stage, session, provider, model, usage, usd)
        if today['calls'] % 10 == 0:
            self.log(f'Model spend today: ${today["usd"]:.4f} over {today["calls"]} calls')
        return result, usage, target

    def record(self, stage, session, provider, model, usage, usd):
        path = self.desk.state.directory / 'costs.csv'
        with self.csv_lock:
            new = not path.exists()
            with open(path, 'a', newline='') as f:
                w = csv.writer(f)
                if new:
                    w.writerow(['time', 'stage', 'session', 'provider', 'model', 'input', 'cached', 'output', 'usd'])
                w.writerow([dt.datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ'), stage, session, provider, model,
                            usage['input'] + usage.get('cacheWrite', 0), usage['cacheRead'], usage['output'], f'{usd:.6f}'])


def llm_spec(config):
    """The llm block, with the pre-2026-11-14 configs (summaryModel on OpenAI) still working."""
    spec = config.get('llm')
    if spec is None:
        spec = {'provider': 'openai', 'model': config['summaryModel']} if config.get('summaryModel') else {'provider': 'none'}
    if not isinstance(spec, dict) or spec.get('provider') not in LLM_PROVIDERS:
        raise LiveError('llm.provider must be anthropic, zai, openai or none')
    fb = spec.get('fallback')
    if fb is not None and (not isinstance(fb, dict) or fb.get('provider') not in KEY_ENV or not fb.get('model')):
        raise LiveError('llm.fallback must be null or {"provider": "zai" | "anthropic" | "openai", "model": ...}')
    if spec['provider'] != 'none' and not spec.get('model'):
        raise LiveError('llm.model is required')
    return spec


def asr_provider(config):
    p = config.get('transcriptionProvider') or ('openai' if config.get('transcriptionModel') else 'mlx')
    if p not in ASR_PROVIDERS:
        raise LiveError('transcriptionProvider must be mlx, zai or openai')
    return p
