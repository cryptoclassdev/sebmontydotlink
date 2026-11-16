"""Stage frames and X post pictures (opt-in): what is taken, which note gets which picture, what is sent."""
import importlib.util, json, pathlib, subprocess, tempfile, unittest
from unittest.mock import patch
root=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('collect',root/'collector/collect.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
live=c.live;xwatch=c.xwatch
WEBP=b'RIFF\x00\x00\x00\x00WEBPVP8 '+b'\x07'*5000

class Frames(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.state=c.State(self.tmp.name,1)
        self.config={'siteUrl':'http://127.0.0.1:4317','frames':{'enabled':True}};self.desk=c.Desk(self.config,self.state,'t');c.STOP.clear()
        self.stage={'id':'main','name':'Main Stage','sourceUrl':'https://www.youtube.com/watch?v=abcdefghijk'}
    def tearDown(self):self.tmp.cleanup()
    def frame(self,cid,data=WEBP):
        d=c.frame_dir(self.desk,'main');d.mkdir(parents=True,exist_ok=True)
        (d/(cid+'.img')).write_bytes(data);(d/(cid+'.json')).write_text(json.dumps({'at':'2026-11-16T13:02:00+00:00','type':'image/webp'}))
    def outbox(self):return [json.loads(p.read_text()) for p in (pathlib.Path(self.tmp.name)/'outbox').glob('*.json')]

    def test_off_by_default(self):
        self.assertIsNone(c.frames_conf({}));self.assertIsNone(c.frames_conf({'frames':{'enabled':'yes'}}))
        self.frame('chunk-a');e={'id':'alert-1','kind':'announcement','excerpt':'hello world'}
        c.attach_frames(c.Desk({'siteUrl':'http://127.0.0.1:4317'},self.state,'t'),self.stage,[{'id':'chunk-a','text':'hello world'}],[],[e])
        self.assertNotIn('image',e);self.assertEqual(self.outbox(),[])

    def test_note_gets_the_frame_of_the_chunk_its_excerpt_came_from(self):
        self.frame('chunk-a',WEBP+b'a');self.frame('chunk-b',WEBP+b'b')
        items=[{'id':'chunk-a','text':'Ledger Atom brings the Seeker apps'},{'id':'chunk-b','text':'London pitches itself to builders'}]
        e={'id':'alert-1','kind':'announcement','excerpt':'Ledger Atom brings the Seeker apps'}
        c.attach_frames(self.desk,self.stage,items,[],[e])
        sent=self.outbox();self.assertEqual(len(sent),1);m=sent[0]['media']
        self.assertEqual(e['image']['id'],m['id']);self.assertRegex(m['id'],r'^f[a-f0-9]{32}$');self.assertEqual(m['type'],'image/webp')
        self.assertTrue(c.base64.b64decode(m['data']).endswith(b'a'));self.assertEqual(e['image']['credit'],'Main Stage livestream')

    def test_falls_back_to_a_neighbouring_chunk_and_skips_updates_and_bad_files(self):
        self.frame('chunk-a');self.frame('chunk-b',b'<html>not an image</html>')
        items=[{'id':'chunk-a','text':'one'},{'id':'chunk-b','text':'two'}]
        e={'id':'alert-1','kind':'briefing','excerpt':'two'};u={'id':'alert-0','kind':'briefing','excerpt':'two','update':True}
        c.attach_frames(self.desk,self.stage,items,[],[e,u])
        self.assertIn('image',e);self.assertNotIn('image',u)

    def test_no_frame_means_no_picture(self):
        e={'id':'alert-1','kind':'briefing','excerpt':'x'}
        c.attach_frames(self.desk,self.stage,[{'id':'chunk-z','text':'x'}],[],[e])
        self.assertNotIn('image',e);self.assertEqual(self.outbox(),[])

    def test_grabber_takes_frames_only_for_youtube_and_only_when_on(self):
        g=c.FrameGrabber(self.desk,'main',lambda m:None)
        g.request('chunk-a');self.assertEqual(len(g.queue),0)  # no source yet
        g.set_source(('audio','https://example.com/a.mp3'));g.request('chunk-a');self.assertEqual(len(g.queue),0)
        g.thread=True  # do not start the worker
        g.set_source(('youtube','abcdefghijk'));g.request('chunk-a',45.0);self.assertEqual(list(g.queue)[0][:2],('chunk-a',45.0))
        self.desk.config['frames']={'enabled':False};g.request('chunk-b');self.assertEqual(len(g.queue),1)

    def test_grab_writes_the_picture_and_never_logs_the_stream_url(self):
        said=[];g=c.FrameGrabber(self.desk,'main',said.append);g.set_source(('youtube','abcdefghijk'));g.dir.mkdir(parents=True)
        secret='https://rr1.googlevideo.com/videoplayback?sig=SECRET'
        resolve=lambda vid,fmt:(secret,'94',True)
        def run(cmd,**kw):
            pathlib.Path(cmd[-1]).write_bytes(b'\xff\xd8\xff'+b'\x01'*6000);return subprocess.CompletedProcess(cmd,0,'','')
        with patch.object(live,'resolve_audio',side_effect=resolve),patch.object(live.subprocess,'run',side_effect=run),patch.object(live,'to_webp',side_effect=lambda s,d,*a:(pathlib.Path(d).write_bytes(WEBP),'image/webp')[1]):
            g.grab('chunk-a',None,('youtube','abcdefghijk'))
        self.assertTrue((g.dir/'chunk-a.img').exists());self.assertEqual(json.loads((g.dir/'chunk-a.json').read_text())['type'],'image/webp')
        self.assertFalse(any('SECRET' in m or 'googlevideo' in m for m in said))
        # A failed grab clears the URL (it may have expired) and the error text is redacted.
        def fail(cmd,**kw):return subprocess.CompletedProcess(cmd,1,'',secret+': Server returned 403 Forbidden')
        g.resolved_at=0
        with patch.object(live,'resolve_audio',side_effect=resolve),patch.object(live.subprocess,'run',side_effect=fail):
            with self.assertRaises(live.LiveError) as err:g.grab('chunk-b',None,('youtube','abcdefghijk'))
        self.assertNotIn('SECRET',str(err.exception));self.assertIsNone(g.url)

    def test_blank_frame_is_dropped(self):
        g=c.FrameGrabber(self.desk,'main',lambda m:None);g.set_source(('youtube','abcdefghijk'));g.dir.mkdir(parents=True);g.url='https://x';g.resolved_at=c.time.monotonic()
        with patch.object(live,'grab_frame',side_effect=lambda u,o,*a:pathlib.Path(o).write_bytes(b'\xff\xd8\xff'+b'\x00'*100)):
            with self.assertRaises(live.LiveError):g.grab('chunk-a',None,('youtube','abcdefghijk'))
        self.assertFalse((g.dir/'chunk-a.img').exists())

    def test_seek_only_for_replays(self):
        cmd=[]
        def run(c_,**kw):cmd.append(c_);return subprocess.CompletedProcess(c_,0,'','')
        live.grab_frame('https://x/v.mp4','/tmp/o.jpg',75.0,run=run);live.grab_frame('https://x/v.m3u8','/tmp/o.jpg',None,run=run)
        live.grab_frame('https://x/v.m3u8','/tmp/o.jpg',None,run=run,segments_back=120)
        self.assertIn('-ss',cmd[0]);self.assertNotIn('-ss',cmd[1]);self.assertNotIn('-live_start_index',cmd[1])
        # ffmpeg cannot seek in a live playlist: a point in the DVR window is counted in segments from the live edge.
        self.assertEqual(cmd[2][cmd[2].index('-live_start_index')+1],'-120');self.assertNotIn('-ss',cmd[2])

    def test_image_kind(self):
        self.assertEqual(live.image_kind(WEBP),'image/webp');self.assertEqual(live.image_kind(b'\xff\xd8\xff\xe0'),'image/jpeg');self.assertIsNone(live.image_kind(b'<svg'))

class XPictures(unittest.TestCase):
    def test_post_picture_is_the_posts_own_media_only(self):
        raw={'extendedEntities':{'media':[{'media_url_https':'https://pbs.twimg.com/amplify_video_thumb/1/img/a.jpg'}]},'card':{'binding_values':{'thumbnail_image':'https://evil.example/x.jpg'}}}
        self.assertEqual(xwatch.post_picture(raw),'https://pbs.twimg.com/amplify_video_thumb/1/img/a.jpg')
        self.assertIsNone(xwatch.post_picture({'card':{'x':1}}))
        self.assertIsNone(xwatch.post_picture({'extendedEntities':{'media':[{'media_url_https':'https://evil.example/a.jpg'}]}}))
        self.assertIsNone(xwatch.post_picture({'extendedEntities':{'media':[{'media_url_https':'http://pbs.twimg.com/a.jpg'}]}}))

    def test_fetcher_refuses_other_hosts_and_attaches_a_picture(self):
        tmp=tempfile.TemporaryDirectory();self.addCleanup(tmp.cleanup)
        desk=c.Desk({'siteUrl':'http://127.0.0.1:4317'},c.State(tmp.name,1),'t');attach=c.x_media_fetcher(desk)
        e={'id':'xw-1','sourceName':'Solana · @solana on X','occurredAt':'2026-11-16T12:00:00Z'}
        with patch.object(c.OPENER,'open') as op:attach(e,'https://evil.example/a.jpg');op.assert_not_called()
        class R:
            def __enter__(s):return s
            def __exit__(s,*a):return False
            def read(s,n):return b'\xff\xd8\xff'+b'\x02'*8000
        with patch.object(c.OPENER,'open',return_value=R()) as op,patch.object(live,'to_webp',side_effect=lambda s,d,*a:(pathlib.Path(d).write_bytes(WEBP),'image/webp')[1]):
            attach(e,'https://pbs.twimg.com/media/abc.jpg')
        self.assertTrue(op.call_args[0][0].full_url.endswith('/media/abc.jpg?name=small'))
        self.assertEqual(e['image']['kind'],'x');self.assertEqual(e['image']['credit'],'@solana on X');self.assertRegex(e['image']['id'],r'^x[a-f0-9]{32}$')
        self.assertEqual(len(list((pathlib.Path(tmp.name)/'outbox').glob('*.json'))),1)

if __name__=='__main__':unittest.main()
