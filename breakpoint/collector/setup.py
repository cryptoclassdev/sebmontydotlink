#!/usr/bin/env python3
"""Native masked secret entry. Secrets never pass through chat or process arguments.

Stores provider keys (twitterapi.io and the AI key for sorting posts) and the two Breakpoint access tokens (the same values as
BREAKPOINT_INGEST_TOKEN and BREAKPOINT_EDITOR_TOKEN in the Vercel project) in
breakpoint/.local/provider-secrets.json with owner-only permissions.
"""
import json, os, pathlib, subprocess
root=pathlib.Path(__file__).resolve().parents[1];path=root/'.local/provider-secrets.json'
data=json.loads(path.read_text()) if path.exists() else {}
for key,label in [('INGEST_TOKEN','Breakpoint ingest token (BREAKPOINT_INGEST_TOKEN on Vercel)'),('EDITOR_TOKEN','Breakpoint editor token (BREAKPOINT_EDITOR_TOKEN on Vercel)'),('TWITTERAPI_IO_KEY','twitterapi.io API key'),('TRIAGE_API_KEY','AI key for sorting X posts (your Z.ai GLM API key)')]:
    script='set r to display dialog "'+label+' (Cancel to leave unchanged)" default answer "" with hidden answer buttons {"Cancel", "Save"} default button "Save"\ntext returned of r'
    result=subprocess.run(['osascript','-'],input=script,text=True,capture_output=True)
    if result.returncode==0 and result.stdout.strip():data[key]=result.stdout.strip()
path.parent.mkdir(parents=True,exist_ok=True)
fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
with os.fdopen(fd,'w') as f:json.dump(data,f)
os.chmod(path,0o600)
print('Credentials saved locally with owner-only access. No paid requests were made.')
