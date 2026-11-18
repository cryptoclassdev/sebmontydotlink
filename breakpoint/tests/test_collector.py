import importlib.util, json, pathlib, tempfile, unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('collect',pathlib.Path(__file__).resolve().parents[1]/'collector/collect.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
class Tests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.state=c.State(self.tmp.name,1);self.config={'siteUrl':'http://127.0.0.1:4317','summaryEveryChunks':2};self.desk=c.Desk(self.config,self.state,'test');c.STOP.clear()
 def tearDown(self):self.tmp.cleanup()
 def test_budget_survives_restart(self):
  self.state.reserve(.7,'test')
  with self.assertRaises(c.BudgetExceeded):c.State(self.tmp.name,1).reserve(.4,'test')
 def test_zero_cap_fails_closed(self):
  with self.assertRaises(c.BudgetExceeded):c.State(self.tmp.name,0).reserve(.01,'test')
 def test_queue_retained_on_network_failure(self):
  self.desk.queue({'entries':[{'id':'x'}]})
  with patch.object(self.desk,'send',side_effect=c.SafeError('offline')):
   with self.assertRaises(c.SafeError):self.desk.flush()
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'outbox').glob('*.json'))),1)
  with patch.object(self.desk,'send',return_value={'ok':True}):self.desk.flush()
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'outbox').glob('*.json'))),0)
 def test_rejected_payload_is_set_aside_and_does_not_block_the_queue(self):
  # 15 Nov: one X post with emoji was 4003 UTF-16 units long; the site answered 400 and 15 later updates waited behind it for 15 hours.
  import os
  out=pathlib.Path(self.tmp.name)/'outbox'
  self.desk.queue({'entries':[{'id':'bad'}]});self.desk.queue({'entries':[{'id':'good'}]})
  for i,f in enumerate(sorted(out.glob('*.json'),key=lambda f:json.loads(f.read_text())['entries'][0]['id']!='bad')):os.utime(f,(1000+i,1000+i))
  sent=[]
  def send(p):
   if p['entries'][0]['id']=='bad':raise c.SafeError('HTTP 400; site says: Invalid excerpt',400)
   sent.append(p)
  with patch.object(self.desk,'send',side_effect=send):self.desk.flush()
  self.assertEqual([p['entries'][0]['id'] for p in sent],['good'])
  self.assertEqual(list(out.glob('*.json')),[])
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'outbox-rejected').glob('*.json'))),1)
  # A server or network error keeps the payload for a retry.
  self.desk.queue({'entries':[{'id':'later'}]})
  with patch.object(self.desk,'send',side_effect=c.SafeError('HTTP 503',503)):
   with self.assertRaises(c.SafeError):self.desk.flush()
  self.assertEqual(len(list(out.glob('*.json'))),1)
 def test_entries_are_trimmed_to_site_limits_in_utf16_units(self):
  self.assertEqual(c.fit('abc',3),'abc');self.assertEqual(c.fit('ab\U0001F680',3),'ab');self.assertEqual(c.fit('ab\U0001F680',4),'ab\U0001F680')
  self.desk.queue({'entries':[{'id':'long','excerpt':'a'*3999+'\U0001F680'*3,'title':'t'*200,'takeaways':['x']*20,'projectIds':['solana']*12}]})
  e=json.loads(next((pathlib.Path(self.tmp.name)/'outbox').glob('*.json')).read_text())['entries'][0]
  self.assertEqual(len(e['excerpt'].encode('utf-16-le'))//2,3999);self.assertEqual(len(e['title']),180)
  self.assertEqual(len(e['takeaways']),12);self.assertEqual(len(e['projectIds']),10)
 def test_slow_source_repeats_its_heartbeat_every_minute(self):
  # The site calls a source stale after 3 minutes; the X monitor polls every 10, so its last status is resent every minute.
  sent=[]
  with patch.object(self.desk,'send',side_effect=lambda p:sent.append(p)):
   self.desk.keep_alive('x',now=100.0);self.assertEqual(sent,[])
   self.desk.health('x','live','Watching 208 accounts on X',now=100.0)
   self.desk.keep_alive('x',now=159.0);self.assertEqual(len(sent),1)
   self.desk.keep_alive('x',now=160.0);self.assertEqual(len(sent),2)
   self.assertEqual(sent[-1],{'heartbeat':{'id':'x','state':'live','message':'Watching 208 accounts on X'}})
   self.desk.keep_alive('x',now=200.0);self.assertEqual(len(sent),2)
  with patch.object(self.desk,'send',side_effect=c.SafeError('offline')):self.desk.keep_alive('x',now=230.0)
  self.assertEqual(self.desk.beats['x'][2],230.0)
  self.assertEqual(c.json.loads((pathlib.Path(__file__).resolve().parents[1]/'collector/config.breakpoint-x.json').read_text())['pollSeconds'],600)
 def test_model_needs_verbatim_evidence_known_project(self):
  # A bad item is dropped with a reason (never raised, so one bad answer cannot stall a stage); good items survive.
  stage={'sessionId':'talk','name':'Main','sourceUrl':'https://solana.com'}
  value={'title':'A launch','body':'Source states this','excerpt':'not in source','projectIds':[]}
  dropped=[];self.assertEqual(c.validate_model({'entries':[value]},'We launched today',stage,dropped=dropped),[]);self.assertEqual(len(dropped),1)
  value['excerpt']='We launched';value['projectIds']=['invented','kamino']
  self.assertEqual(c.validate_model({'entries':[value]},'We launched today',stage)[0]['projectIds'],['kamino'])
  value['projectIds']=[]
  self.assertEqual(c.validate_model({'entries':[value]},'We launched today',stage)[0]['status'],'draft')
 def test_failed_model_job_is_parked_not_retried_forever(self):
  stage={'id':'main','sessionId':'talk','name':'Main','sourceUrl':'https://solana.com'};item={'id':'chunk','text':'Transcript','at':c.utc()}
  c.atomic(pathlib.Path(self.tmp.name)/'transcripts/talk/chunk.json',item);c.queue_summary(self.desk,stage,[item])
  with patch.object(c,'model_entries',side_effect=c.SafeError('offline')),patch.object(self.desk,'send',return_value={'ok':True}):c.drain_jobs(self.desk,'key')
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'jobs').glob('*.json'))),0)
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'failed-jobs').glob('*.json'))),1)
  c.queue_summary(self.desk,stage,[item]);self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'jobs').glob('*.json'))),0)
 def test_stage_requires_explicit_identity(self):
  with self.assertRaises(c.SafeError):c.check_stage({'id':'main','sessionId':'talk','sessionConfirmed':False})
 def test_no_bearer_to_http_remote(self):
  with self.assertRaises(c.SafeError):c.Desk({'siteUrl':'http://remote.example'},self.state,'key')
 def test_three_stages_deliver_independently(self):
  from concurrent.futures import ThreadPoolExecutor
  stages=[{'id':id,'name':id,'sessionId':'talk-'+id,'sourceUrl':'https://solana.com'} for id in ['main','royal','lparmy']]
  def capture(stage):
   for i in range(2):
    file=pathlib.Path(self.tmp.name)/'audio'/stage['id']/'run'/f'{i}.wav';file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(b'fixture')
    c.consume_audio(self.desk,stage,file,'test')
  with patch.object(c,'transcribe',return_value='A grounded transcript'):
   with ThreadPoolExecutor(3) as pool:list(pool.map(capture,stages))
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'transcripts').glob('*/*.json'))),6)
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'jobs').glob('*.json'))),3)
  delivered=[]
  with patch.object(c,'model_entries',return_value=[]),patch.object(self.desk,'send',side_effect=lambda p:delivered.append(p)):
   c.drain_jobs(self.desk,'test')
  self.assertEqual(len(delivered),6)
 def test_site_url_with_breakpoint_path(self):
  desk=c.Desk({'siteUrl':'https://www.sebmonty.link/breakpoint/'},self.state,'key')
  self.assertEqual(desk.url,'https://www.sebmonty.link/breakpoint')
if __name__=='__main__':unittest.main()
