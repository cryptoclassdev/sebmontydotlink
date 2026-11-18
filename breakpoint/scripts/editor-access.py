#!/usr/bin/env python3
"""Explicit operator utility: copy the desk token and open its login page."""
import json,pathlib,subprocess,webbrowser
root=pathlib.Path(__file__).resolve().parents[1]
subprocess.run(['osascript','-e','display dialog "Open the editorial desk and copy its access token to your clipboard? Paste it into the desk login only." buttons {"Cancel", "Open desk"} default button "Open desk" cancel button "Cancel"'],check=True,stdout=subprocess.DEVNULL)
token=None
for name in ['provider-secrets.json','secrets.json']:
    path=root/'.local'/name
    if path.exists():token=token or json.loads(path.read_text()).get('EDITOR_TOKEN')
if not token:raise SystemExit('No editor token stored. Run python3 collector/setup.py first.')
subprocess.run(['pbcopy'],input=token.encode(),check=True)
webbrowser.open('https://www.sebmonty.link/breakpoint#editor')
print('Desk opened. Paste the token into its access field. Clipboard contains the token until replaced.')
