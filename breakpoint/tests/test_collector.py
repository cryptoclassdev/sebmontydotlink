import importlib.util, pathlib, tempfile, unittest
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
 def test_model_needs_verbatim_evidence_known_project(self):
  stage={'sessionId':'talk','name':'Main','sourceUrl':'https://solana.com'}
  value={'title':'A launch','body':'Source states this','excerpt':'not in source','projectIds':[]}
  with self.assertRaises(c.SafeError):c.validate_model({'entries':[value]},'We launched today',stage)
  value['excerpt']='We launched';value['projectIds']=['invented']
  with self.assertRaises(c.SafeError):c.validate_model({'entries':[value]},'We launched today',stage)
  value['projectIds']=[]
  self.assertEqual(c.validate_model({'entries':[value]},'We launched today',stage)[0]['status'],'draft')
 def test_summary_job_survives_failure(self):
  stage={'id':'main','sessionId':'talk','name':'Main','sourceUrl':'https://solana.com'};item={'id':'chunk','text':'Transcript','at':c.utc()}
  c.atomic(pathlib.Path(self.tmp.name)/'transcripts/talk/chunk.json',item);c.queue_summary(self.desk,stage,[item])
  with patch.object(c,'model_entries',side_effect=c.SafeError('offline')):
   with self.assertRaises(c.SafeError):c.drain_jobs(self.desk,'key')
  self.assertEqual(len(list((pathlib.Path(self.tmp.name)/'jobs').glob('*.json'))),1)
  with patch.object(c,'model_entries',return_value=[]):c.drain_jobs(self.desk,'key')
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
