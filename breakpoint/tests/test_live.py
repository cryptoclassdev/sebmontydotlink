"""Live stage transcription: session picker, YouTube IDs, filters, model providers, dedupe, dry run."""
import array, datetime as dt, importlib.util, json, math, pathlib, tempfile, unittest, wave
from unittest.mock import patch

HERE = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('collect', HERE / 'collector/collect.py')
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)
live = c.live
UTC = dt.timezone.utc


def at(text):
    return dt.datetime.fromisoformat(text).replace(tzinfo=UTC)


def session(id, time, minutes, stage='Main Stage', date='2026-11-16', verified=True):
    return {'id': id, 'title': 'Talk ' + id, 'date': date, 'time': time, 'durationMinutes': minutes, 'stage': stage, 'dateVerified': verified,
            'speakerNames': ['Ada Lovelace'], 'speakers': [{'name': 'Ada Lovelace', 'project': 'Analytical Engines'}]}


def write_wav(path, samples):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes(array.array('h', samples).tobytes())


SCHEDULE = [session('a', '10:00', 20), session('b', '10:20', 30), session('c', '12:00', 30), session('d', '14:00', 30), session('e', '14:50', 20),
            session('r', '10:00', 60, stage='Royal Exchange'), session('x', '11:00', 30, verified=False)]


class SessionPicker(unittest.TestCase):
    def pick(self, when, offset=0, stage='Main Stage'):
        active, upcoming = live.pick_session(SCHEDULE, stage, at(when), offset)
        return (active or {}).get('id'), (upcoming or {}).get('id')

    def test_before_inside_after(self):
        self.assertEqual(self.pick('2026-11-16T09:50:00'), (None, 'a'))
        self.assertEqual(self.pick('2026-11-16T09:59:10'), ('a', 'b'))  # opens 60 s early
        self.assertEqual(self.pick('2026-11-16T10:10:00'), ('a', 'b'))
        self.assertEqual(self.pick('2026-11-16T10:51:30'), ('b', 'c'))  # 120 s tail after 10:50
        self.assertEqual(self.pick('2026-11-16T10:53:00'), (None, 'c'))

    def test_overlap_takes_latest_start(self):
        self.assertEqual(self.pick('2026-11-16T10:19:30')[0], 'b')
        self.assertEqual(self.pick('2026-11-16T10:21:00')[0], 'b')

    def test_offset_shifts_the_window(self):
        self.assertEqual(self.pick('2026-11-16T10:23:00', offset=5)[0], 'a')  # b opens at 10:24 with the offset
        self.assertEqual(self.pick('2026-11-16T10:26:00', offset=5)[0], 'b')

    def test_lunch_gap_is_idle_with_next_session(self):
        active, upcoming = live.pick_session(SCHEDULE, 'Main Stage', at('2026-11-16T13:00:00'))
        self.assertIsNone(active)
        self.assertEqual(upcoming['id'], 'd')
        self.assertGreater((upcoming['start'] - at('2026-11-16T13:00:00')).total_seconds(), 20 * 60)

    def test_stage_and_verification_filter(self):
        self.assertEqual(self.pick('2026-11-16T10:30:00', stage='Royal Exchange')[0], 'r')
        self.assertNotEqual(self.pick('2026-11-16T11:10:00')[0], 'x')

    def test_london_time_zone(self):
        # November is GMT; a summer date is BST (UTC+1), so 10:00 London is 09:00 UTC.
        self.assertEqual(live.session_window(session('n', '10:00', 10))[0], at('2026-11-16T10:00:00'))
        self.assertEqual(live.session_window(session('s', '10:00', 10, date='2026-06-16'))[0], at('2026-06-16T09:00:00'))

    def test_info_carries_speakers_and_organisations(self):
        active, _ = live.pick_session(SCHEDULE, 'Main Stage', at('2026-11-16T10:05:00'))
        self.assertEqual(active['speakers'], ['Ada Lovelace'])
        self.assertEqual(active['organisations'], ['Analytical Engines'])


class YouTubeIds(unittest.TestCase):
    ID = 'dQw4w9WgXcQ'

    def test_embed_urls(self):
        for url in ['https://www.youtube.com/embed/' + self.ID, 'https://www.youtube-nocookie.com/embed/' + self.ID]:
            self.assertEqual(live.video_id_from_embed(url), self.ID)
        for url in ['http://www.youtube.com/embed/' + self.ID, 'https://player.vimeo.com/video/123', 'https://evil.example/embed/' + self.ID,
                    'https://www.youtube.com/watch?v=' + self.ID, 'https://www.youtube.com/embed/short', None, '']:
            self.assertIsNone(live.video_id_from_embed(url), url)

    def test_page_urls(self):
        for url in ['https://www.youtube.com/watch?v=' + self.ID, 'https://www.youtube.com/watch?v=' + self.ID + '&t=30',
                    'https://www.youtube.com/live/' + self.ID + '?si=x', 'https://youtu.be/' + self.ID, 'https://m.youtube.com/watch?v=' + self.ID]:
            self.assertEqual(live.video_id_from_url(url), self.ID, url)
        for url in ['https://example.com/watch?v=' + self.ID, 'PASTE_YOUTUBE_URL_1', 'https://www.youtube.com/@solana']:
            self.assertIsNone(live.video_id_from_url(url), url)


class Filters(unittest.TestCase):
    def test_excerpt_normaliser_returns_original_wording(self):
        transcript = 'So today  we’re launching   Kamino Lend V3 on mainnet. Thanks!'
        self.assertEqual(live.find_excerpt("we're launching kamino lend v3 on mainnet", transcript), 'we’re launching   Kamino Lend V3 on mainnet')
        self.assertEqual(live.find_excerpt('"We’re launching Kamino Lend V3 on mainnet."', transcript), 'we’re launching   Kamino Lend V3 on mainnet')
        self.assertIsNone(live.find_excerpt('we are launching Kamino', transcript))
        self.assertIsNone(live.find_excerpt('...', transcript))

    def test_title_dedupe(self):
        earlier = ['Jupiter launches JUP staking rewards on mainnet']
        self.assertTrue(live.similar_title('Jupiter launches JUP staking rewards mainnet', earlier))
        self.assertFalse(live.similar_title('Kamino opens new lending vaults', earlier))

    def test_junk_segments_are_dropped(self):
        prompt = 'Solana, Breakpoint, Jupiter, Kamino.'
        segments = [{'text': ' Welcome to Breakpoint.', 'no_speech_prob': 0.1}, {'text': 'Thank you for watching!', 'no_speech_prob': 0.2},
                    {'text': 'mumble', 'no_speech_prob': 0.9}, {'text': 'Solana, Breakpoint, Jupiter, Kamino.', 'no_speech_prob': 0.3},
                    {'text': 'Okay.', 'no_speech_prob': 0.1}, {'text': 'Okay.', 'no_speech_prob': 0.1}, {'text': '♪♪', 'no_speech_prob': 0.1}]
        self.assertEqual(live.clean_segments(segments, prompt), ['Welcome to Breakpoint.', 'Okay.'])
        self.assertFalse(live.enough_words('Okay. Thanks'))
        self.assertTrue(live.enough_words('We shipped it'))

    def test_glossary_puts_this_talk_first_and_stays_short(self):
        g = live.glossary({'speakers': ['Ada Lovelace'], 'organisations': ['Analytical Engines']}, c.PROJECTS)
        self.assertTrue(g.startswith('Ada Lovelace, Analytical Engines, Solana'))
        self.assertLessEqual(len(g), 601)

    def test_silent_chunk_is_skipped_before_transcription(self):
        with tempfile.TemporaryDirectory() as tmp:
            quiet, tone = pathlib.Path(tmp) / 'quiet.wav', pathlib.Path(tmp) / 'tone.wav'
            write_wav(quiet, [0] * 16000)
            write_wav(tone, [int(8000 * math.sin(i / 8)) for i in range(16000)])
            self.assertLess(live.wav_rms(quiet), 1)
            self.assertGreater(live.wav_rms(tone), 1000)
            config = {'transcriptionProvider': 'mlx', 'silenceRms': 150}
            with patch.object(live, 'transcribe_mlx', side_effect=AssertionError('silence must not be transcribed')):
                self.assertEqual(c.transcribe(quiet, config, None, {}), '')
            with patch.object(live, 'transcribe_mlx', return_value='Thank you'):
                self.assertEqual(c.transcribe(tone, config, None, {}), '')  # under 3 words
            with patch.object(live, 'transcribe_mlx', return_value='Kamino ships vaults today') as mlx:
                self.assertEqual(c.transcribe(tone, config, None, {}, {'speakers': ['Ada Lovelace']}), 'Kamino ships vaults today')
                self.assertIn('Ada Lovelace', mlx.call_args[0][2])


def anthropic_reply(entries, usage=None):
    return {'content': [{'type': 'text', 'text': 'ok'}, {'type': 'tool_use', 'name': 'publish_entries', 'input': {'entries': entries}}],
            'usage': usage or {'input_tokens': 900, 'cache_read_input_tokens': 1200, 'cache_creation_input_tokens': 0, 'output_tokens': 150}}


def chat_reply(content):
    return {'choices': [{'message': {'content': content}}], 'usage': {'prompt_tokens': 2000, 'prompt_tokens_details': {'cached_tokens': 500}, 'completion_tokens': 100}}


ITEM = {'kind': 'announcement', 'title': 'Kamino ships Lend V3', 'body': 'Kamino said Lend V3 is live on mainnet today.', 'excerpt': 'Lend V3 is live on mainnet today',
        'takeaways': ['Live today'], 'projectIds': ['kamino'], 'tokenImpact': 'indirect', 'impactReason': 'Product news for a project with a token.'}


class Providers(unittest.TestCase):
    def test_parsers(self):
        result, usage = live.parse_anthropic(anthropic_reply([ITEM]))
        self.assertEqual(result['entries'][0]['title'], ITEM['title'])
        self.assertEqual(usage, {'input': 900, 'cacheRead': 1200, 'cacheWrite': 0, 'output': 150})
        with self.assertRaises(live.ProviderError):
            live.parse_anthropic({'content': [{'type': 'text', 'text': 'no tool'}]})
        body = json.dumps({'entries': [ITEM]})
        for content in [body, '```json\n' + body + '\n```', 'Here you go:\n' + body]:
            result, usage = live.parse_chat(chat_reply(content))
            self.assertEqual(result['entries'][0]['kind'], 'announcement')
            self.assertEqual(usage, {'input': 1500, 'cacheRead': 500, 'cacheWrite': 0, 'output': 100})
        with self.assertRaises(live.ProviderError):
            live.parse_chat(chat_reply('not json'))

    def test_cost(self):
        price = {'in': 2.0, 'cacheRead': 0.10, 'cacheWrite': 2.50, 'out': 10.0}
        self.assertAlmostEqual(live.cost_usd({'input': 1_000_000, 'cacheRead': 0, 'cacheWrite': 0, 'output': 0}, price), 2.0)
        self.assertAlmostEqual(live.cost_usd({'input': 900, 'cacheRead': 1200, 'cacheWrite': 0, 'output': 150}, price), 0.00342)


class Pipeline(unittest.TestCase):
    """Model jobs end to end with a fake provider: only newTranscript counts, bad items drop, duplicates drop, costs log."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.config = {'siteUrl': 'http://127.0.0.1:4317/breakpoint', 'summaryEveryChunks': 2, 'contextChunks': 6, 'publishProvisional': True,
                       'publishKinds': ['announcement', 'summary'], 'chunkSeconds': 30, 'summaryReservePerCallUsd': 0.02,
                       'llm': {'provider': 'anthropic', 'model': 'claude-sonnet-5-5', 'fallback': {'provider': 'zai', 'model': 'glm-5.1'},
                               'prices': {'claude-sonnet-5-5': {'in': 2.0, 'cacheRead': 0.1, 'cacheWrite': 2.5, 'out': 10.0}, 'glm-5.1': {'in': 1.4, 'out': 4.4}}},
                       'stages': [{'id': 'main', 'name': 'Main Stage'}]}
        self.state = c.State(self.tmp.name, 5)
        self.desk = c.Desk(self.config, self.state, '', dry_run=True)
        self.stage = {'id': 'main', 'name': 'Main Stage', 'sourceUrl': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
        self.session = {'id': 'bp26-talk', 'title': 'Kamino keynote', 'speakers': ['Ada Lovelace'], 'organisations': []}
        self.calls = []
        self.n = 0
        c.STOP.clear()

    def tearDown(self):
        self.tmp.cleanup()

    def llm(self, replies):
        def post(url, body, headers):
            self.calls.append((url, body))
            reply = replies.pop(0)
            if isinstance(reply, Exception):
                raise reply
            return reply
        return live.LLM(self.desk, {'ANTHROPIC_API_KEY': 'a', 'ZAI_API_KEY': 'z'}, log=lambda *_: None, post=post, sleep=lambda *_: None)

    def chunks(self, texts):
        for text in texts:
            self.n += 1
            f = pathlib.Path(self.tmp.name) / 'audio' / f'{self.n:06d}.wav'
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_bytes(b'x')
            with patch.object(c, 'transcribe', return_value=text):
                c.consume_audio(self.desk, self.stage, f, {}, self.session)

    def jobs(self):
        return sorted((pathlib.Path(self.tmp.name) / 'jobs').glob('*.json'))

    def test_new_transcript_only_and_bad_items_dropped(self):
        self.chunks(['Earlier we said Lend V2 is old news.', 'Welcome back everyone.', 'Kamino Lend V3 is live on mainnet today', 'Questions later.'])
        self.assertEqual(len(self.jobs()), 2)
        second = json.loads(self.jobs()[1].read_text())
        self.assertEqual(len(second['transcriptIds']), 2)
        self.assertEqual(len(second['contextIds']), 2)
        from_context = dict(ITEM, title='Lend V2 is old', excerpt='Lend V2 is old news')
        bad = dict(ITEM, title='Invented', excerpt='never said this')
        llm = self.llm([anthropic_reply([]), anthropic_reply([ITEM, from_context, bad])])
        c.drain_jobs(self.desk, llm)
        lines = [json.loads(x) for x in (pathlib.Path(self.tmp.name) / 'dry-run.jsonl').read_text().splitlines()]
        entries = [e for line in lines for e in line['payload'].get('entries', [])]
        self.assertEqual([e['title'] for e in entries], ['Kamino ships Lend V3'])
        self.assertEqual(entries[0]['status'], 'provisional')
        self.assertEqual(entries[0]['sourceName'], 'Main Stage · live transcript (auto)')
        self.assertEqual(entries[0]['sessionId'], 'bp26-talk')
        payload = json.loads(self.calls[1][1]['messages'][0]['content'])
        self.assertIn('Lend V3', payload['newTranscript'])
        self.assertIn('Lend V2', payload['context'])
        self.assertEqual(payload['session']['title'], 'Kamino keynote')
        self.assertEqual(self.calls[1][1]['tool_choice'], {'type': 'tool', 'name': 'publish_entries'})
        self.assertEqual(self.calls[1][1]['system'][0]['cache_control'], {'type': 'ephemeral'})
        rows = (pathlib.Path(self.tmp.name) / 'costs.csv').read_text().splitlines()
        self.assertEqual(rows[0], 'time,stage,session,provider,model,input,cached,output,usd')
        self.assertEqual(len(rows), 3)
        self.assertEqual(len(self.jobs()), 0)

    def test_duplicates_and_briefings(self):
        self.chunks(['Kamino Lend V3 is live on mainnet today', 'yes', 'Kamino Lend V3 is live on mainnet today again', 'we discussed fees'])
        repeat = dict(ITEM, title='Kamino ships Lend V3 on mainnet', excerpt='Kamino Lend V3 is live on mainnet today again')
        note = dict(ITEM, kind='briefing', title='Panel discusses fees', excerpt='we discussed fees')
        llm = self.llm([anthropic_reply([ITEM]), anthropic_reply([repeat, note])])
        c.drain_jobs(self.desk, llm)
        payload = json.loads(self.calls[1][1]['messages'][0]['content'])
        self.assertEqual(payload['alreadyCovered'], ['Kamino ships Lend V3'])
        lines = [json.loads(x) for x in (pathlib.Path(self.tmp.name) / 'dry-run.jsonl').read_text().splitlines()]
        entries = [e for line in lines for e in line['payload'].get('entries', [])]
        self.assertEqual(sorted((e['title'], e['status']) for e in entries), [('Kamino ships Lend V3', 'provisional'), ('Panel discusses fees', 'draft')])

    def test_retry_then_fallback_and_failed_job(self):
        self.chunks(['Kamino Lend V3 is live on mainnet today', 'and more'])
        glm = chat_reply('```json\n' + json.dumps({'entries': [ITEM]}) + '\n```')
        llm = self.llm([live.ProviderError('HTTP 529', 529, True), live.ProviderError('timeout', None, True), glm])
        c.drain_jobs(self.desk, llm)
        self.assertEqual([u for u, _ in self.calls], [live.ANTHROPIC_URL, live.ANTHROPIC_URL, live.ZAI_CHAT_URL])
        self.assertEqual(self.calls[2][1]['thinking'], {'type': 'disabled'})
        self.assertIn('glm-5.1', (pathlib.Path(self.tmp.name) / 'costs.csv').read_text())
        # A non-retryable error parks the job and capture carries on.
        self.chunks(['third chunk here', 'fourth chunk here'])
        c.drain_jobs(self.desk, self.llm([live.ProviderError('HTTP 400 invalid_request_error', 400, False)]))
        self.assertEqual(len(list((pathlib.Path(self.tmp.name) / 'failed-jobs').glob('*.json'))), 1)
        self.assertEqual(len(self.jobs()), 0)

    def test_session_close_queues_recap_once_after_three_minutes(self):
        runner = c.StageRunner(self.desk, {'id': 'main', 'name': 'Main Stage', 'sourceUrl': self.stage['sourceUrl']}, {}, None)
        runner.source_url = self.stage['sourceUrl']
        self.chunks(['one two three'] * 1 + ['four five six'])
        runner.close_session(self.session)
        self.assertFalse(any(json.loads(p.read_text())['final'] for p in self.jobs()))
        self.session = {'id': 'bp26-long', 'title': 'Long talk', 'speakers': [], 'organisations': []}
        self.chunks([f'sentence number {i} here' for i in range(7)])
        runner.close_session(self.session)
        runner.close_session(self.session)
        finals = [json.loads(p.read_text()) for p in self.jobs() if json.loads(p.read_text())['final']]
        self.assertEqual(len(finals), 1)
        self.assertEqual(len(finals[0]['transcriptIds']), 7)
        recap = dict(ITEM, kind='briefing', title='Long talk recap', excerpt='sentence number 3 here')
        replies = [anthropic_reply([]) for _ in self.jobs()]
        replies[-1] = anthropic_reply([recap])
        c.drain_jobs(self.desk, self.llm(replies))
        entries = [e for x in (pathlib.Path(self.tmp.name) / 'dry-run.jsonl').read_text().splitlines() for e in json.loads(x)['payload'].get('entries', [])]
        self.assertEqual([(e['kind'], e['status'], e['id'].startswith('summary-')) for e in entries], [('summary', 'provisional', True)])


class FakeBootstrap:
    def __init__(self, value):
        self.value = value

    def get(self):
        return self.value


class RunnerPlan(unittest.TestCase):
    """Schedule mode with the desk link: when capture runs, pre-roll, lunch gap and a missing link."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.config = {'siteUrl': 'https://www.sebmonty.link/breakpoint', 'sessionMode': 'schedule', 'llm': {'provider': 'none'},
                       'stages': [{'id': 'main', 'name': 'Main Stage', 'enabled': True, 'youtube': 'desk', 'scheduleOffsetMinutes': 0}]}
        self.desk = c.Desk(self.config, c.State(self.tmp.name, 1), '', dry_run=True)
        self.stream = {'id': 'main', 'name': 'Main Stage', 'embedUrl': 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'enabled': True}
        self.runner = c.StageRunner(self.desk, self.config['stages'][0], {}, FakeBootstrap({'streams': [self.stream], 'sessions': SCHEDULE}))
        self.runner.start_ffmpeg = lambda: setattr(self.runner, 'proc', 'running')
        self.runner.stop_ffmpeg = lambda consume=True: setattr(self.runner, 'proc', None)

    def tearDown(self):
        self.tmp.cleanup()

    def step(self, when):
        now = at(when)
        self.runner.apply(*self.runner.plan(now), now=now)
        return (self.runner.session or {}).get('id'), self.runner.proc, self.runner.status

    def test_day_flow(self):
        self.assertEqual(self.step('2026-11-16T09:30:00')[:2], (None, None))          # 30 min before: idle, no yt-dlp
        self.assertEqual(self.step('2026-11-16T09:51:00')[:2], (None, 'running'))     # 9 min before: pre-roll
        self.assertEqual(self.step('2026-11-16T10:05:00')[:2], ('a', 'running'))
        self.assertEqual(self.runner.source_url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        self.assertEqual(self.step('2026-11-16T10:21:00')[:2], ('b', 'running'))
        self.assertEqual(self.step('2026-11-16T10:53:30')[:2], (None, None))          # next talk at 12:00: stop
        self.assertEqual(self.step('2026-11-16T12:40:00')[:2], (None, None))          # lunch: more than 20 min away, stop
        self.assertIn('Between sessions', self.runner.status[1])
        self.assertEqual(self.step('2026-11-16T13:45:00')[:2], (None, None))          # 15 min away: not yet
        self.assertEqual(self.step('2026-11-16T13:52:00')[:2], (None, 'running'))     # 8 min away: pre-roll
        self.assertEqual(self.step('2026-11-16T14:10:00')[:2], ('d', 'running'))
        self.assertEqual(self.step('2026-11-16T14:35:00')[:2], (None, 'running'))     # 15 min gap to e: stay connected
        self.assertEqual(self.step('2026-11-16T14:51:00')[:2], ('e', 'running'))

    def test_missing_desk_link_waits(self):
        self.stream['enabled'] = False
        self.assertEqual(self.step('2026-11-16T10:05:00'), (None, None, ('ready', 'Waiting for the stream link on the desk')))


class Reload(unittest.TestCase):
    def test_offset_edit_applies_and_bad_edit_is_ignored(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = pathlib.Path(tmp) / 'config.json'
            config = json.loads((HERE / 'collector/config.breakpoint-stages.json').read_text())
            path.write_text(json.dumps(config))
            desk = c.Desk(json.loads(path.read_text()), c.State(tmp, 15), '', dry_run=True)
            watch = c.ConfigWatch(path, desk, {'ANTHROPIC_API_KEY': 'a'})
            config['stages'][0]['scheduleOffsetMinutes'] = 7
            config['dailyBudgetUsd'] = 20
            path.write_text(json.dumps(config))
            watch.mtime = None
            watch.check()
            self.assertEqual(desk.config['stages'][0]['scheduleOffsetMinutes'], 7)
            self.assertEqual(desk.state.cap, 20)
            config['stages'][0]['scheduleOffsetMinutes'] = 999
            path.write_text(json.dumps(config))
            watch.mtime = None
            watch.check()
            self.assertEqual(desk.config['stages'][0]['scheduleOffsetMinutes'], 7)


class ProviderErrors(unittest.TestCase):
    def test_ai_provider_reason_is_shown_site_body_is_not(self):
        import io, urllib.error
        body = b'{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API."}}'
        def fail(req, timeout=None):
            raise urllib.error.HTTPError(req.full_url, 400, 'Bad Request', {}, io.BytesIO(body))
        with patch.object(c.OPENER, 'open', side_effect=fail):
            with self.assertRaises(c.SafeError) as ai:
                c.http_json('https://api.anthropic.com/v1/messages', 'POST', {}, {'x-api-key': 'sk-ant-secret'})
            with self.assertRaises(c.SafeError) as site:
                c.http_json('https://www.sebmonty.link/breakpoint/api/ingest', 'POST', {})
        self.assertIn('credit balance is too low', str(ai.exception))
        self.assertNotIn('sk-ant', str(ai.exception))
        self.assertEqual(str(site.exception), 'HTTP 400; credentials and provider body withheld')


class DryRun(unittest.TestCase):
    def test_writes_jsonl_and_never_posts(self):
        with tempfile.TemporaryDirectory() as tmp:
            desk = c.Desk({'siteUrl': 'https://www.sebmonty.link/breakpoint'}, c.State(tmp, 1), '', dry_run=True)
            with patch.object(c.OPENER, 'open', side_effect=AssertionError('no network in dry run')):
                desk.queue({'entries': [{'id': 'alert-1', 'kind': 'announcement', 'status': 'provisional', 'title': 'T', 'stage': 'Main Stage'}]})
                desk.queue({'transcript': {'id': 'chunk-1', 'text': ''}})  # empty transcripts are not sent
                desk.flush()
                desk.health('main', 'live', 'ok')
            lines = (pathlib.Path(tmp) / 'dry-run.jsonl').read_text().splitlines()
            self.assertEqual(len(lines), 2)
            self.assertEqual(json.loads(lines[0])['payload']['entries'][0]['id'], 'alert-1')

    def test_config_checks(self):
        base = json.loads((HERE / 'collector/config.breakpoint-stages.json').read_text())
        c.validate_config(base)
        rehearsal = json.loads((HERE / 'collector/config.rehearsal.json').read_text())
        c.validate_config(rehearsal)
        with self.assertRaises(c.SafeError):
            c.check_live_stage(rehearsal, rehearsal['stages'][0])  # placeholder link
        stage = dict(rehearsal['stages'][0], youtube='https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        c.check_live_stage(rehearsal, stage)
        with self.assertRaises(c.SafeError):
            c.require_keys(base, {'ZAI_API_KEY': 'z'})
        c.require_keys(base, {'ANTHROPIC_API_KEY': 'a'})  # Sonnet with a Haiku fallback: one key
        with self.assertRaises(c.SafeError):
            c.validate_config(dict(base, publishKinds=['briefing']))


if __name__ == '__main__':
    unittest.main()
