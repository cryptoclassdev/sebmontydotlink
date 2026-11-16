#!/usr/bin/env python3
"""Pictures for stage notes published before frame capture was on: a still from the stage's YouTube stream at the
time each note was written.

    python3 collector/backfill_frames.py --stage "Main Stage" --video desk            # dry run: saves the stills, sends nothing
    python3 collector/backfill_frames.py --stage "Main Stage" --video desk --send     # sends them to the site

--video is a YouTube link or id, or "desk" for the link on the desk (Broadcast connections).
While the stream is live, YouTube keeps about the last hour, so only notes from that hour can be done; once the stream
has ended and YouTube has published the recording, every note of the day can (pass the recording's link if it differs).

Each note's moment is its "audio processed" time minus --lag-seconds (the note's speech came up to a minute before
that, and the stream runs some seconds behind the room). A recap gets the moment of the talk's first note, or 5
minutes before its end. The site only adds a picture to a note that has none and whose picture an editor has not
removed; text, status and owner are never changed. Stream URLs are signed: never printed. The ingest token comes from
.local/provider-secrets.json (python3 collector/setup.py) or INGEST_TOKEN.
"""
import argparse, base64, datetime as dt, hashlib, json, os, pathlib, re, subprocess, sys, tempfile, time, urllib.parse, urllib.request
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import live

ROOT = pathlib.Path(__file__).resolve().parents[1]
KINDS = ('announcement', 'briefing', 'summary')


def get_json(url, headers=None, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, method='POST' if body is not None else 'GET',
                                 headers={'User-Agent': 'SebMonty-Breakpoint-backfill/1.0', 'Accept': 'application/json', **({'Content-Type': 'application/json'} if body is not None else {}), **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read(20_000_000))


def when(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00')).timestamp()


def stream_info(video_id):
    """(start unix time, is_live) for a YouTube video."""
    r = subprocess.run([live.ytdlp_path() or 'yt-dlp', '--no-warnings', '--print', '%(release_timestamp)s %(timestamp)s %(is_live)s', live.watch_url(video_id)],
                       capture_output=True, text=True, timeout=90)
    if r.returncode != 0:
        raise live.LiveError('yt-dlp failed: ' + live.redact((r.stderr or '').strip().splitlines()[-1:] or ['no detail'])[:200])
    release, stamp, is_live = (r.stdout.strip().split() + ['NA', 'NA', 'NA'])[:3]
    start = next((int(x) for x in (release, stamp) if x.isdigit()), None)
    if start is None:
        raise live.LiveError('YouTube gives no start time for this video')
    return start, is_live == 'True'


def dvr_window(url):
    """(seconds, segment count) of a live stream's DVR window, from its HLS playlist."""
    with urllib.request.urlopen(url, timeout=30) as r:
        text = r.read(5_000_000).decode('utf-8', 'replace')
    durations = [float(x) for x in re.findall(r'#EXTINF:([\d.]+)', text)]
    return sum(durations), len(durations)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--site', default='https://www.sebmonty.link/breakpoint')
    ap.add_argument('--stage', required=True, help='Stage name as on the site, e.g. "Main Stage"')
    ap.add_argument('--video', required=True, help='YouTube link or id, or "desk"')
    ap.add_argument('--since', help='Only notes at or after this ISO time (default: today, London)')
    ap.add_argument('--lag-seconds', type=float, default=50)
    ap.add_argument('--limit', type=int, default=200)
    ap.add_argument('--out', default=str(ROOT / '.local/backfill-frames'), help='Where the stills are saved for checking')
    ap.add_argument('--send', action='store_true', help='Send to the site (default: dry run)')
    a = ap.parse_args()
    site = a.site.rstrip('/')
    if a.video == 'desk':
        boot = get_json(site + '/api/live')
        rec = next((s for s in boot.get('streams', []) if s.get('name') == a.stage), None)
        vid = live.video_id_from_embed((rec or {}).get('embedUrl'))
    else:
        vid = live.video_id_from_url(a.video) or (a.video if live.VIDEO_ID.fullmatch(a.video) else None)
    if not vid:
        sys.exit('No YouTube video for that stage')
    since = when(a.since) if a.since else dt.datetime.now(live.LONDON).replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    token = os.environ.get('INGEST_TOKEN') or ''
    if a.send and not token:
        try:
            token = json.loads((ROOT / '.local/provider-secrets.json').read_text()).get('INGEST_TOKEN', '')
        except (OSError, ValueError):
            pass
        if not token:
            sys.exit('INGEST_TOKEN is missing (run python3 collector/setup.py)')

    # Published notes from this stage without a picture (the public feed, newest first).
    notes, cursor = [], None
    for _ in range(8):
        page = get_json(site + '/api/feed' + ('?cursor=' + urllib.parse.quote(cursor) if cursor else ''))
        for e in page.get('entries', []):
            if e.get('stage') == a.stage and e.get('kind') in KINDS and 'live transcript' in (e.get('sourceName') or '') and e.get('status') != 'withdrawn' and when(e['occurredAt']) >= since:
                notes.append(e)
        cursor = page.get('nextCursor')
        if not cursor or all(when(e['occurredAt']) < since for e in page.get('entries', [])[-5:]):
            break
    todo = [e for e in notes if not e.get('image')][:a.limit]
    first_note = {}
    for e in notes:
        if e['kind'] != 'summary' and e.get('sessionId'):
            first_note[e['sessionId']] = min(first_note.get(e['sessionId'], 1e12), when(e['occurredAt']))

    start, is_live = stream_info(vid)
    url, fmt, _ = live.resolve_audio(vid, live.FRAME_FORMAT)
    window, count = dvr_window(url) if is_live else (None, 0)
    print(f'{a.stage}: {len(notes)} stage notes, {len(todo)} without a picture. Video {vid}, format {fmt}, '
          + (f'live (YouTube keeps the last {window / 60:.0f} min)' if is_live else 'recording') + ('' if a.send else '. DRY RUN: nothing is sent.'))
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    done = skipped = 0
    for e in todo:
        t = when(e['occurredAt'])
        if e['kind'] == 'summary':
            t = first_note.get(e.get('sessionId'), t - 300)
        t -= a.lag_seconds
        if is_live:
            back = time.time() - t
            if back > window - 30:
                skipped += 1; print(f'  skip  {e["id"]}: older than the stream keeps ({back / 60:.0f} min ago)'); continue
            seek = None; back_segments = max(1, round(back / (window / count)))
        else:
            seek = t - start; back_segments = None
            if seek < 0:
                skipped += 1; print(f'  skip  {e["id"]}: before the recording starts'); continue
        with tempfile.TemporaryDirectory() as tmp:
            jpg = pathlib.Path(tmp) / 'f.jpg'; img = pathlib.Path(tmp) / 'f.img'
            try:
                live.grab_frame(url, jpg, seek, 640, segments_back=back_segments)
                if jpg.stat().st_size < live.FRAME_MIN_BYTES:
                    raise live.LiveError('blank frame')
                mime = live.to_webp(jpg, img, 640, 62); data = img.read_bytes()
            except (live.LiveError, OSError) as err:
                skipped += 1; print(f'  skip  {e["id"]}: {live.redact(err)[:120]}'); continue
        mid = 'f' + hashlib.sha256(data).hexdigest()[:32]
        at = dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        (out / f'{e["id"]}{".webp" if mime == "image/webp" else ".jpg"}').write_bytes(data)
        label = f'{dt.datetime.fromtimestamp(t, live.LONDON):%H:%M:%S}  {e["kind"]:<12} {e["title"][:70]}'
        if a.send:
            auth = {'Authorization': 'Bearer ' + token}
            get_json(site + '/api/ingest', auth, {'media': {'id': mid, 'kind': 'stream', 'type': mime, 'data': base64.b64encode(data).decode('ascii'), 'at': at}})
            r = get_json(site + '/api/ingest', auth, {'attach': [{'entryId': e['id'], 'image': {'id': mid, 'kind': 'stream', 'at': at, 'credit': a.stage + ' livestream'}}]})
            ok = (r.get('results') or [{}])[0]
            print(f'  {"sent " if ok.get("attached") else "kept "} {label}' + ('' if ok.get('attached') else f' ({ok.get("reason")})'))
        else:
            print(f'  still {label}  ({len(data) // 1000} KB)')
        done += 1
    print(f'Done: {done} stills, {skipped} skipped. Stills saved in {out} to check by eye.')


if __name__ == '__main__':
    try:
        main()
    except (live.LiveError, OSError, ValueError) as e:
        sys.exit(live.redact(e)[:300])
