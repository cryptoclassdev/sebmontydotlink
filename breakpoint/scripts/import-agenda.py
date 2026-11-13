"""Import inert, rendered official agenda export. Run after source verification.

Input: research/agenda-rendered.json (a fresh export of all day/stage tabs of
https://solana.com/breakpoint/schedule). Afterwards run scripts/clean-seed.py.
"""
import json,re,hashlib,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
raw=json.loads((ROOT/'research/agenda-rendered.json').read_text())
p=ROOT/'data/seed.json';seed=json.loads(p.read_text());prior={s['title']:s for s in seed['sessions']};speakers={s['name']:s for s in seed['speakers']};sessions=[]
for row in raw['sessions']:
 assert row['date'] in ['2026-11-16','2026-11-17'] and re.fullmatch(r'\d\d:\d\d',row['time'])
 parsed=[]
 for person in row['speakers']:
  full=person.get('roleAndProject') or '';role,sep,org=full.rpartition(', ')
  if not sep:role=full;org=''
  parsed.append({'name':person['name'],'role':role,'project':org})
  if person['name'] not in speakers:
   speakers[person['name']]={'id':re.sub('[^a-z0-9]+','-',person['name'].lower()).strip('-'),'name':person['name'],'role':role,'organization':org,'projectId':None,'xHandle':None,'xUrl':None,'sourceUrl':raw['source'],'observedAt':raw['observedAt']}
 context=' '.join([row['title']]+[s['project'] for s in parsed]);ids=[]
 for project in seed['projects']:
  if re.search(r'(?<!\w)'+re.escape(project['name'])+r'(?!\w)',context,re.I):ids.append(project['id'])
 d=row['duration'].lower();duration=int(re.search(r'\d+',d).group())*(60 if 'hr' in d else 1)
 sessions.append({'id':prior.get(row['title'],{}).get('id','bp26-'+hashlib.sha256((row['date']+row['stage']+row['title']).encode()).hexdigest()[:14]),'title':row['title'],'time':row['time'],'durationMinutes':duration,'date':row['date'],'stage':row['stage'],'timezone':'Europe/London','speakerNames':[s['name'] for s in parsed],'projectIds':ids,'sourceUrl':raw['source'],'observedAt':raw['observedAt'],'status':'scheduled','dateVerified':True,'dateNote':'Day and stage tabs verified in the rendered official agenda. Times may change.','speakers':parsed})
seed['sessions']=sorted(sessions,key=lambda s:(s['date'],s['time'],s['stage']));seed['speakers']=sorted(speakers.values(),key=lambda s:s['name']);seed['events'].sort(key=lambda e:e['startsAt']);seed['updatedAt']=raw['observedAt']
seed['entries'][0]['body']=f"The official programme lists {len(sessions)} talks across Main Stage and Royal Exchange on Monday 16 and Tuesday 17 November. Explore the verified dates, speaker profiles and project links, then build your watchlist. Times can change; each listing links to the official agenda."
seed['entries'][0]['takeaways'][1]=f"{len(sessions)} talks across the two published stages; Monday 16 and Tuesday 17 November."
for k in ['occurredAt','receivedAt','updatedAt']:seed['entries'][0][k]=raw['observedAt']
p.write_text(json.dumps(seed,ensure_ascii=False,indent=2)+'\n');(ROOT/'research/sessions.json').write_text(json.dumps(seed['sessions'],ensure_ascii=False,indent=2)+'\n')
print(f"Imported {len(sessions)} sessions and {len(speakers)} speaker profiles")
