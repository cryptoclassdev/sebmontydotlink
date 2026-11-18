"""Attach verified X accounts and their stored profile pictures to the speakers and organisations in data/seed.json.

Usage (from breakpoint/, after scripts/import-agenda.py, scripts/clean-seed.py and scripts/fetch-x-avatars.py):
  python3 scripts/link-x-accounts.py

Reads data/x-accounts.json (accounts the X monitor watches) and data/x-accounts-pictures.json (accounts used only
for pictures). Speakers match by name; organisations match the agenda's organisation text by name, after
normalising (case, accents, punctuation, bracketed notes), or through ORG_ALIASES below. Nothing is guessed:
a speaker or organisation with no verified account keeps xHandle null and shows initials on the site.

Writes, idempotently:
- speakers[].xHandle / xUrl / avatar (file name in assets/avatars, or null)
- organizations: {agenda organisation text: {name, xHandle, xUrl, avatar}}
- xAvatars: lower-case handles that have a stored picture (the site uses it for "Straight from X" posts)
"""
import json, pathlib, re, unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[1]
AVATARS = ROOT / 'assets/avatars'

# Agenda organisation text -> company handle, where the names differ. Each target is a verified account in the
# accounts files; the reason is given so the mapping can be checked.
ORG_ALIASES = {
    'Akash': 'akashnet',                                 # Akash Network
    'Marinade Labs': 'MarinadeFinance',                  # Marinade
    'Multicoin': 'multicoincap',                         # Multicoin Capital
    'Pyth Network / Pyth Data Association': 'PythNetwork',
    'Reflect Money': 'reflectmoney',                     # Reflect
    'Solana / Solana Labs': 'solana',                    # Anatoly Yakovenko; the Solana brand account
    'Ramp': 'RampNetwork',                               # x-accounts.json links Ramp Network to this talk
    'Fidelity Digital Asset Management': 'digitalassets',  # Fidelity Digital Assets, linked to the same talk
    'Fiserv Digital Asset Services': 'Fiserv',
    'WisdomTree Onchain': 'WisdomTreeFunds',
}


def norm(text):
    text = unicodedata.normalize('NFKD', text or '').encode('ascii', 'ignore').decode().lower()
    text = re.sub(r'\(.*?\)', '', text)
    return re.sub(r'[^a-z0-9]+', '', text)


def main():
    accounts = []
    for f in ['data/x-accounts.json', 'data/x-accounts-pictures.json']:
        path = ROOT / f
        if path.exists(): accounts += json.loads(path.read_text())['accounts']
    avatar = lambda h: f'{h.lower()}.webp' if (AVATARS / f'{h.lower()}.webp').exists() else None
    by_handle = {a['handle'].lower(): a for a in accounts}
    people = {norm(a['name']): a for a in accounts if a['kind'] == 'speaker'}
    companies = {}
    for a in accounts:
        if a['kind'] != 'company': continue
        for key in (a['name'], a['org']):
            companies.setdefault(norm(key), a)

    path = ROOT / 'data/seed.json'
    seed = json.loads(path.read_text())

    linked = 0
    for s in seed['speakers']:
        a = people.get(norm(s['name']))
        if not a and s.get('xHandle'): a = by_handle.get(s['xHandle'].lower())
        if a:
            s['xHandle'], s['xUrl'], s['avatar'] = a['handle'], f"https://x.com/{a['handle']}", avatar(a['handle'])
            linked += 1
        else:
            s['avatar'] = avatar(s['xHandle']) if s.get('xHandle') else None

    names = {p['project'] for x in seed['sessions'] for p in x['speakers']} | {s['organization'] for s in seed['speakers']}
    orgs = {}
    for name in sorted(n for n in names if n):
        a = by_handle.get(ORG_ALIASES[name].lower()) if name in ORG_ALIASES else companies.get(norm(name))
        if a: orgs[name] = {'name': a['name'], 'xHandle': a['handle'], 'xUrl': f"https://x.com/{a['handle']}", 'avatar': avatar(a['handle'])}
    seed['organizations'] = orgs
    seed['xAvatars'] = sorted(p.stem for p in AVATARS.glob('*.webp'))
    path.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + '\n')

    faces = sum(1 for s in seed['speakers'] if s.get('avatar'))
    logos = sum(1 for o in orgs.values() if o['avatar'])
    print(f"Speakers: {linked}/{len(seed['speakers'])} with a verified X account, {faces} with a picture")
    print(f"Organisations: {len(orgs)}/{len([n for n in names if n])} with a verified X account, {logos} with a picture")
    print('Speakers on initials:', ', '.join(s['name'] for s in seed['speakers'] if not s.get('avatar')))
    print('Organisations on initials:', ', '.join(n for n in sorted(names) if n and not (orgs.get(n) or {}).get('avatar')))


if __name__ == '__main__':
    main()
