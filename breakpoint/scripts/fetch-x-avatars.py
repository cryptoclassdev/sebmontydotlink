"""Download the profile picture of every verified X account in data/x-accounts.json and
data/x-accounts-pictures.json, once, into the repo.

Usage (from breakpoint/, key loaded in the same command, never printed):
  set -a; source "/path/to/.env"; set +a; python3 scripts/fetch-x-avatars.py [--refresh] [handle ...]

Each picture is read through twitterapi.io (user/info -> profilePicture, 400x400 variant), resized to
96 x 96 px WebP with cwebp and saved as assets/avatars/<handle in lower case>.webp. The site serves them
from /breakpoint/avatars/ (scripts/build.mjs) and never loads X image URLs at runtime.
Existing files are kept unless --refresh is given. assets/avatars/SOURCES.md lists every file, its
account and the date it was taken. Then run scripts/link-x-accounts.py to attach them to speakers.
"""
import json, os, pathlib, subprocess, sys, tempfile, time, urllib.parse, urllib.request
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/avatars'
INFO = 'https://api.twitterapi.io/twitter/user/info?userName='
ALLOWED_IMAGE_HOST = 'pbs.twimg.com'


def load_all():
    """Watched accounts (data/x-accounts.json) plus picture-only ones (data/x-accounts-pictures.json)."""
    out = []
    for f in ['data/x-accounts.json', 'data/x-accounts-pictures.json']:
        path = ROOT / f
        if path.exists(): out += json.loads(path.read_text())['accounts']
    return out


def get(url, headers=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'breakpoint-guide', **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main(argv):
    key = os.environ.get('TWITTERAPI_IO_KEY')
    if not key:
        sys.exit('TWITTERAPI_IO_KEY is not set (load it from the .env in the same command)')
    refresh = '--refresh' in argv
    only = {a.lower() for a in argv if not a.startswith('--')}
    accounts = load_all()
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    failed = []
    for a in accounts:
        handle = a['handle']; name = handle.lower(); dest = OUT / f'{name}.webp'
        if only and name not in only: continue
        if dest.exists() and not refresh: continue
        try:
            info = json.loads(get(INFO + urllib.parse.quote(handle), {'X-API-Key': key}))
            data = info.get('data') or {}
            pic = data.get('profilePicture') or ''
            if info.get('status') != 'success' or data.get('userName', '').lower() != name or not pic:
                raise ValueError(f"no profile for @{handle}: {info.get('msg') or info.get('message') or 'missing picture'}")
            if 'default_profile_images' in pic:
                raise ValueError('account uses the default X picture')
            if urllib.parse.urlparse(pic).hostname != ALLOWED_IMAGE_HOST:
                raise ValueError(f'unexpected image host {pic}')
            big = pic.replace('_normal.', '_400x400.')
            with tempfile.TemporaryDirectory() as tmp:
                src = pathlib.Path(tmp) / 'in'
                src.write_bytes(get(big))
                subprocess.run(['cwebp', '-quiet', '-q', '82', '-resize', '96', '96', str(src), '-o', str(dest)], check=True)
            manifest[name] = {'handle': data['userName'], 'name': data.get('name', ''), 'taken': date.today().isoformat()}
            print(f'ok   @{handle}')
        except Exception as e:  # keep going; the account falls back to initials
            failed.append(handle); print(f'skip @{handle}: {e}')
        time.sleep(0.2)
    manifest_path.write_text(json.dumps(dict(sorted(manifest.items())), ensure_ascii=False, indent=2) + '\n')
    write_sources(manifest, accounts)
    print(f"{len(manifest)} avatars on disk; {len(failed)} skipped: {', '.join(failed) or 'none'}")


def write_sources(manifest, accounts):
    by = {a['handle'].lower(): a for a in accounts}
    rows = []
    for name, m in manifest.items():
        a = by.get(name)
        if not a: continue
        rows.append(f"| {a['name']} | {a['kind']} | `{name}.webp` | https://x.com/{m['handle']} | {a['source']}{' (' + a['how'] + ')' if a.get('how') else ''} | {m['taken']} |")
    (OUT / 'SOURCES.md').write_text(
        '# X profile pictures\n\n'
        'Each file is the current profile picture of a verified X account listed in `data/x-accounts.json` or `data/x-accounts-pictures.json` '
        '(speakers: linked from the official speakers page; companies: linked from the company site or checked on the profile). '
        'They identify a speaker or company next to its own name. Downloaded once through twitterapi.io with '
        '`scripts/fetch-x-avatars.py` (400 x 400 from X), resized to 96 x 96 px WebP. `scripts/build.mjs` copies them '
        'to `public/breakpoint/avatars/`; the site never loads X image URLs.\n\n'
        'Accounts without a file show initials. Profile pictures change: rerun the script with `--refresh <handle>` to update one.\n\n'
        '| Name | Kind | File | X account | How the account was confirmed (source) | Taken |\n| --- | --- | --- | --- | --- | --- |\n'
        + '\n'.join(rows) + '\n')


if __name__ == '__main__':
    main(sys.argv[1:])
