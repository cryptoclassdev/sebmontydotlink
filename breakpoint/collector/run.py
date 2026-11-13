#!/usr/bin/env python3
"""Load only this application's secrets, then run its collector."""
import json, os, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
for name in ['secrets.json','provider-secrets.json']:
    path=root/'.local'/name
    if path.exists():
        for k,v in json.loads(path.read_text()).items():
            if k in ['INGEST_TOKEN','X_BEARER_TOKEN','OPENAI_API_KEY','TWITTERAPI_IO_KEY']:os.environ[k]=v
os.execv(sys.executable,[sys.executable,str(root/'collector/collect.py'),*sys.argv[1:]])
