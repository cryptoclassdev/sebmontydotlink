"""Import a rendered export of the official agenda into data/seed.json. Run after source verification.

Usage (from breakpoint/):
  python3 scripts/import-agenda.py research/agenda-export-2026-11-13.json
  python3 scripts/clean-seed.py

Accepts either export format:
- compact rows {d, s, t, m, ti, sp:[[name, roleAndProject]], g:[tracks]} (read from the page's
  day/stage tabs in a real browser; breaks have no stage and take the stage of the row before them)
- the original {sessions:[{date, stage, time, duration, title, speakers:[{name, roleAndProject}]}]}

Existing session ids are kept when the title matches, or when only the title changed for the same
day, stage and start time, so links and desk assignments survive renames. Speakers who no longer
appear in any session are dropped from the directory; curated fields (X handle, project) are kept.
"""
import json, re, hashlib, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'research/agenda-rendered.json'
raw = json.loads(src.read_text())
source = raw.get('source', 'https://solana.com/breakpoint/schedule'); observed = raw['observedAt']

rows, breaks = [], []
if 'rows' in raw:
    last_stage = None
    for r in raw['rows']:
        if r.get('s'): last_stage = r['s']
        row = {'date': r['d'], 'stage': r.get('s') or last_stage, 'time': r['t'], 'duration': r['m'], 'title': r['ti'],
               'speakers': [{'name': n, **({'roleAndProject': rp} if rp else {})} for n, rp in r['sp']], 'tracks': r.get('g', [])}
        (rows if r.get('s') else breaks).append(row)
else:
    rows = [dict(s, tracks=s.get('tracks', [])) for s in raw['sessions']]

p = ROOT / 'data/seed.json'; seed = json.loads(p.read_text())
by_title = {s['title']: s for s in seed['sessions']}
by_slot = {(s['date'], s['stage'], s['time']): s for s in seed['sessions']}
known = {s['name']: s for s in seed['speakers']}
minutes = lambda d: int(re.search(r'\d+', d).group()) * (60 if 'hr' in d.lower() else 1)
ACRONYMS = {'AI', 'RWA', 'DeFi', 'UK', 'US'}
title_case = lambda t: ' '.join(w if w in ACRONYMS else w.capitalize() if w.isupper() else w for w in t.split())

sessions, used = [], set()
for row in rows:
    assert row['date'] in ['2026-11-16', '2026-11-17'] and re.fullmatch(r'\d\d:\d\d', row['time']) and row['stage'] in ['Main Stage', 'Royal Exchange'], row
    parsed = []
    for person in row['speakers']:
        full = person.get('roleAndProject') or ''; role, sep, org = full.rpartition(', ')
        if not sep: role, org = full, ''
        parsed.append({'name': person['name'], 'role': role, 'project': org})
    context = ' '.join([row['title']] + [s['project'] for s in parsed]); ids = []
    for project in seed['projects']:
        if re.search(r'(?<!\w)' + re.escape(project['name']) + r'(?!\w)', context, re.I): ids.append(project['id'])
    prior = by_title.get(row['title']) or by_slot.get((row['date'], row['stage'], row['time']))
    sid = prior['id'] if prior and prior['id'] not in used else 'bp26-' + hashlib.sha256((row['date'] + row['stage'] + row['title']).encode()).hexdigest()[:14]
    used.add(sid)
    sessions.append({'id': sid, 'title': row['title'], 'time': row['time'], 'durationMinutes': minutes(row['duration']), 'date': row['date'], 'stage': row['stage'], 'timezone': 'Europe/London',
                     'tracks': [title_case(t) for t in row.get('tracks', [])], 'speakerNames': [s['name'] for s in parsed], 'projectIds': ids, 'sourceUrl': source, 'observedAt': observed,
                     'status': 'scheduled', 'dateVerified': True, 'dateNote': 'Day and stage tabs verified in the rendered official agenda. Times may change.', 'speakers': parsed})

speakers = {}
for s in sessions:
    for person in s['speakers']:
        name = person['name']
        if name in speakers: continue
        base = known.get(name)
        if base: speakers[name] = {**base, 'role': person['role'] if not person['role'].startswith('Moderator') else base['role'], 'organization': person['project'] or base.get('organization', '')}
        else: speakers[name] = {'id': re.sub('[^a-z0-9]+', '-', name.lower()).strip('-'), 'name': name, 'role': person['role'].replace('Moderator · ', ''), 'organization': person['project'], 'projectId': None, 'xHandle': None, 'xUrl': None, 'sourceUrl': source, 'observedAt': observed}

seed['sessions'] = sorted(sessions, key=lambda s: (s['date'], s['time'], s['stage']))
seed['speakers'] = sorted(speakers.values(), key=lambda s: s['name'])
seed['breaks'] = [{'date': b['date'], 'stage': b['stage'], 'time': b['time'], 'durationMinutes': minutes(b['duration']), 'title': b['title']} for b in breaks]
seed['events'].sort(key=lambda e: e['startsAt']); seed['updatedAt'] = observed
day = observed[:10]; pretty = f"{int(day[8:])} November"
seed['entries'][0]['body'] = f"The official programme lists {len(sessions)} talks across Main Stage and Royal Exchange on Monday 16 and Tuesday 17 November. Explore the verified dates, speaker profiles and project links, then build your watchlist. Times can change; each listing links to the official agenda."
seed['entries'][0]['takeaways'][1] = f"{len(sessions)} talks across the two published stages; Monday 16 and Tuesday 17 November."
for k in ['occurredAt', 'receivedAt', 'updatedAt']: seed['entries'][0][k] = observed
p.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'research/sessions.json').write_text(json.dumps(seed['sessions'], ensure_ascii=False, indent=2) + '\n')
print(f"Imported {len(sessions)} sessions, {len(seed['breaks'])} breaks and {len(speakers)} speaker profiles (checked {pretty})")
