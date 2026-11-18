"""Fix known formatting errors in the imported agenda. Idempotent; run after scripts/import-agenda.py.

Each fix only tidies how the official agenda's own text was split into name / role / organisation.
No speaker, session or affiliation is invented.
"""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
path = ROOT / 'data/seed.json'
seed = json.loads(path.read_text())

# name -> (new name, role, organisation); None keeps the existing value
PEOPLE = {
    'Luke Truitt - Formation': ('Luke Truitt', 'CEO', 'Orca (Formation)'),  # Formation was formed by merging Orca and Loopscale
    'Irene Tse - Graticule Asset Management Asia': ('Irene Tse', 'Partner', 'Graticule Asset Management Asia (GAMA)'),
    'Jess  Houlgrave': ('Jess Houlgrave', None, None),
    'Paul-Adrien  Hyppolite': ('Paul-Adrien Hyppolite', None, None),
    'Sir Sajid Javid': (None, 'Former Chancellor of the Exchequer', ''),
    'Boris Johnson': (None, 'Former Prime Minister', ''),
    'Michael Lewis': (None, 'Author', ''),
    'Tristan Thompson': (None, 'NBA Champion and Investor', ''),
    'Peter Moore': (None, 'Sports and Video Game Executive', 'Owner, Wisla Krakow Football Club (Poland)'),
}
NOT_A_PERSON = {'Payward'}  # the agenda lists the company with no speaker name
TITLES = {'The Three Most Important Questions for Valuing Solana"': 'The Three Most Important Questions for Valuing Solana'}

slug = lambda n: re.sub('[^a-z0-9]+', '-', n.lower()).strip('-')
speakers = []
for s in seed['speakers']:
    if s['name'] in NOT_A_PERSON:
        continue
    fix = PEOPLE.get(s['name'])
    if fix:
        name, role, org = fix
        if name: s['name'], s['id'] = name, slug(name)
        if role is not None: s['role'] = role
        if org is not None: s['organization'] = org
    speakers.append(s)
seed['speakers'] = sorted(speakers, key=lambda s: s['name'])

for session in seed['sessions']:
    session['title'] = TITLES.get(session['title'], session['title'])
    for p in session['speakers']:
        fix = PEOPLE.get(p['name'])
        if fix:
            name, role, org = fix
            if name: p['name'] = name
            if role is not None: p['role'] = role if not p['role'].startswith('Moderator') else p['role']
            if org is not None: p['project'] = org
        if p['name'] in NOT_A_PERSON and not p.get('role'):
            p['role'], p['project'] = 'Speaker name not published', p['name']
    session['speakerNames'] = [p['name'] for p in session['speakers']]

path.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + '\n')
print(f"Cleaned seed: {len(seed['sessions'])} sessions, {len(seed['speakers'])} speakers")
