import datetime as dt, importlib.util, json, pathlib, tempfile, unittest, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('collect', ROOT / 'collector/collect.py')
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)
x = c.xwatch

ACCOUNTS = [
    {'handle': 'kamino', 'name': 'Kamino', 'kind': 'company', 'org': 'Kamino', 'projectId': 'kamino',
     'talks': [{'sessionId': 'bp26-kamino', 'startsAt': '2026-11-16T12:00:00Z', 'title': 'Talk'}]},
    {'handle': 'WeiszM', 'name': 'Michael Weisz', 'kind': 'speaker', 'org': 'Kamino', 'projectId': 'kamino', 'talks': []},
    {'handle': 'phantom', 'name': 'Phantom', 'kind': 'company', 'org': 'Phantom', 'projectId': None, 'talks': []},
]
NOW = dt.datetime(2026, 11, 16, 12, 30, tzinfo=dt.timezone.utc)


def tweet(i, user, text, when='Mon Nov 16 12:20:00 +0000 2026', **extra):
    return {'id': str(i), 'text': text, 'createdAt': when, 'author': {'userName': user}, **extra}


class FakeHttp:
    """Answers twitterapi.io searches from a list of pages and OpenAI triage from a verdict map."""
    def __init__(self, pages, verdicts, fail_triage=False):
        self.pages, self.verdicts, self.fail_triage, self.calls = list(pages), verdicts, fail_triage, []

    def __call__(self, url, method='GET', body=None, headers=None):
        self.calls.append((url, method, body, headers))
        if url.startswith(x.SEARCH_API):
            assert headers == {'X-API-Key': 'tk'}
            return self.pages.pop(0) if self.pages else {'tweets': [], 'has_next_page': False}
        if url == x.OPENAI_API:
            assert headers == {'Authorization': 'Bearer ok'}
            if self.fail_triage:
                raise c.SafeError('HTTP 500')
            posts = json.loads(body['messages'][1]['content'])['posts']
            items = [dict({'id': p['id']}, **self.verdicts.get(p['id'], {'verdict': 'skip'})) for p in posts]
            return {'choices': [{'message': {'content': json.dumps({'items': items})}}]}
        raise AssertionError(url)


ALPHA = {'verdict': 'alpha', 'kind': 'announcement', 'title': 'Kamino launches fixed-rate vaults', 'summary': 'Kamino says fixed-rate vaults are live.',
         'tokenImpact': 'indirect', 'impactReason': 'Product launch', 'novelty': 'new'}
MAYBE = dict(ALPHA, verdict='maybe', kind='update', title='Phantom teases news', summary='Phantom says news is coming.')


class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.state = c.State(self.tmp.name, 5)
        self.config = {'siteUrl': 'http://127.0.0.1:4317', 'publishProvisional': True, 'xMaxPagesPerBatch': 2}
        self.desk = c.Desk(self.config, self.state, 'test')
        self.sent = []
        self.desk.send = lambda payload: self.sent.append(payload) or {'ok': True}

    def tearDown(self):
        self.tmp.cleanup()

    def run_poll(self, http, config=None):
        return x.poll(self.desk, self.state, {**self.config, **(config or {})}, ACCOUNTS, c.PROJECTS, {'twitterapi': 'tk', 'openai': 'ok'}, http, now=NOW)

    def entries(self):
        return [e for p in self.sent if 'entries' in p for e in p['entries']]

    def test_accounts_file_is_valid_and_queries_fit(self):
        accounts = x.load_accounts(ROOT / 'data/x-accounts.json')
        self.assertGreater(len(accounts), 150)
        for group in x.batches([a['handle'] for a in accounts], 480):
            self.assertLessEqual(len(x.build_query(group, 9999999999)), 480)
        self.assertEqual(sorted(h for g in x.batches([a['handle'] for a in accounts]) for h in g), sorted(a['handle'] for a in accounts))
        for a in accounts:
            self.assertTrue(a['source'].startswith('https://'))
            for t in a['talks']:
                x.parse_time(t['startsAt'])

    def test_bad_accounts_file_fails_closed(self):
        path = pathlib.Path(self.tmp.name) / 'a.json'
        path.write_text(json.dumps({'accounts': [{'handle': 'ok'}, {'handle': 'OK'}]}))
        with self.assertRaises(x.XWatchError):
            x.load_accounts(path)
        path.write_text(json.dumps({'accounts': [{'handle': 'bad handle'}]}))
        with self.assertRaises(x.XWatchError):
            x.load_accounts(path)

    def test_query_shape(self):
        q = x.build_query(['kamino', 'phantom'], 1763290000)
        self.assertEqual(q, '(from:kamino OR from:phantom) -filter:replies -filter:retweets since_time:1763290000')

    def test_alpha_published_maybe_drafted_skip_dropped(self):
        page = {'tweets': [tweet(1, 'kamino', 'Fixed-rate vaults are live on Kamino. $KMNO'), tweet(2, 'phantom', 'Something big at Breakpoint'),
                           tweet(3, 'WeiszM', 'See you at our booth!')], 'has_next_page': False}
        http = FakeHttp([page], {'1': ALPHA, '2': MAYBE})
        report = self.run_poll(http)
        self.assertEqual(report, {'accounts': 3, 'newPosts': 3, 'published': 1, 'drafts': 1})
        by_id = {e['id']: e for e in self.entries()}
        self.assertEqual(set(by_id), {'xw-1', 'xw-2'})
        a = by_id['xw-1']
        self.assertEqual((a['status'], a['kind'], a['sessionId']), ('provisional', 'announcement', 'bp26-kamino'))
        self.assertEqual(a['excerpt'], 'Fixed-rate vaults are live on Kamino. $KMNO')  # the post's own words
        self.assertEqual(a['sourceUrl'], 'https://x.com/kamino/status/1')
        self.assertEqual(a['projectIds'], ['kamino'])
        self.assertEqual(a['sourceName'], 'Kamino · @kamino on X')
        self.assertEqual(a['occurredAt'], '2026-11-16T12:20:00Z')
        b = by_id['xw-2']
        self.assertEqual((b['status'], b['kind'], b['sessionId'], b['projectIds']), ('draft', 'social', None, []))
        heartbeat = [p for p in self.sent if 'heartbeat' in p][-1]['heartbeat']
        self.assertEqual(heartbeat['state'], 'live')
        self.assertIn('Watching 3 accounts', heartbeat['message'])

    def test_entries_pass_the_site_validator_shape(self):
        page = {'tweets': [tweet(1, 'kamino', 'Fixed-rate vaults are live on Kamino.')], 'has_next_page': False}
        self.run_poll(FakeHttp([page], {'1': ALPHA}))
        e = self.entries()[0]
        for key in ['id', 'kind', 'status', 'title', 'body', 'sourceUrl', 'sourceName', 'occurredAt', 'projectIds', 'excerpt']:
            self.assertIn(key, e)
        self.assertRegex(e['id'], r'^[a-zA-Z0-9_-]{1,100}$')
        self.assertLessEqual(len(e['title']), 180)

    def test_publish_off_keeps_alpha_as_draft(self):
        page = {'tweets': [tweet(1, 'kamino', 'Live now.')], 'has_next_page': False}
        self.run_poll(FakeHttp([page], {'1': ALPHA}), {'publishProvisional': False})
        self.assertEqual(self.entries()[0]['status'], 'draft')

    def test_strangers_replies_and_retweets_are_ignored(self):
        page = {'tweets': [tweet(5, 'someoneelse', 'Kamino is great'), tweet(6, 'kamino', 'reply', isReply=True),
                           tweet(7, 'kamino', 'RT', retweeted_tweet={'id': '1'}), tweet(8, 'kamino', '   ')], 'has_next_page': False}
        report = self.run_poll(FakeHttp([page], {}))
        self.assertEqual(report['newPosts'], 0)
        self.assertEqual(self.entries(), [])

    def test_duplicates_across_polls_are_sent_once(self):
        page = {'tweets': [tweet(1, 'kamino', 'Live now.')], 'has_next_page': False}
        self.run_poll(FakeHttp([page], {'1': ALPHA}))
        report = self.run_poll(FakeHttp([page], {'1': ALPHA}))
        self.assertEqual(report['newPosts'], 0)
        self.assertEqual(len(self.entries()), 1)

    def test_since_window_advances_with_overlap(self):
        http = FakeHttp([], {})
        self.run_poll(http, {'xFirstLookMinutes': 30, 'xOverlapSeconds': 90})
        q = urllib.parse.parse_qs(urllib.parse.urlparse(http.calls[0][0]).query)['query'][0]
        self.assertTrue(q.endswith(f'since_time:{int(NOW.timestamp()) - 1800}'))
        http2 = FakeHttp([], {})
        self.run_poll(http2, {'xOverlapSeconds': 90})
        q2 = urllib.parse.parse_qs(urllib.parse.urlparse(http2.calls[0][0]).query)['query'][0]
        self.assertTrue(q2.endswith(f'since_time:{int(NOW.timestamp()) - 90}'))

    def test_pagination_is_bounded(self):
        pages = [{'tweets': [tweet(i, 'kamino', f'post {i}')], 'has_next_page': True, 'next_cursor': f'c{i}'} for i in range(1, 6)]
        http = FakeHttp(pages, {})
        report = self.run_poll(http, {'xMaxPagesPerBatch': 2})
        self.assertEqual(report['newPosts'], 2)
        searches = [u for u, *_ in http.calls if u.startswith(x.SEARCH_API)]
        self.assertEqual(len(searches), 2)
        self.assertIn('cursor=c1', searches[1])

    def test_triage_failure_keeps_posts_for_retry(self):
        page = {'tweets': [tweet(1, 'kamino', 'Live now.')], 'has_next_page': False}
        with self.assertRaises(c.SafeError):
            self.run_poll(FakeHttp([page], {}, fail_triage=True))
        self.assertEqual([p['id'] for p in self.state.value['xwatch']['pending']], ['1'])
        self.assertEqual(self.entries(), [])
        report = self.run_poll(FakeHttp([], {'1': ALPHA}))
        self.assertEqual(report['published'], 1)
        self.assertEqual(self.state.value['xwatch']['pending'], [])
        self.assertEqual(self.entries()[0]['id'], 'xw-1')

    def test_triage_output_is_validated(self):
        posts = [{'id': '1'}, {'id': '2'}]
        with self.assertRaises(x.XWatchError):
            x.validate_triage({'items': [{'id': '1', 'verdict': 'skip'}]}, posts)  # missing post 2
        with self.assertRaises(x.XWatchError):
            x.validate_triage({'items': [{'id': '1', 'verdict': 'skip'}, {'id': '9', 'verdict': 'skip'}]}, posts)
        with self.assertRaises(x.XWatchError):
            x.validate_triage({'items': [{'id': '1', 'verdict': 'alpha', 'title': '', 'summary': 'x'}, {'id': '2', 'verdict': 'skip'}]}, posts)
        with self.assertRaises(x.XWatchError):
            x.validate_triage({'items': [{'id': '1', 'verdict': 'buy'}, {'id': '2', 'verdict': 'skip'}]}, posts)
        ok = x.validate_triage({'items': [{'id': '1', 'verdict': 'alpha', 'title': ' A  b ', 'summary': 's', 'tokenImpact': 'moon'}, {'id': '2', 'verdict': 'skip'}]}, posts)
        self.assertEqual((ok['1']['title'], ok['1']['tokenImpact'], ok['1']['kind']), ('A b', 'unclear', 'update'))

    def test_budget_gate_stops_paid_calls(self):
        self.state = c.State(pathlib.Path(self.tmp.name) / 'b', 0.002)
        page = {'tweets': [tweet(1, 'kamino', 'Live now.')], 'has_next_page': False}
        with self.assertRaises(c.BudgetExceeded):
            x.poll(self.desk, self.state, {**self.config, 'xReservePerRequestUsd': 0.003}, ACCOUNTS, c.PROJECTS, {'twitterapi': 'tk', 'openai': 'ok'}, FakeHttp([page], {}), now=NOW)

    def test_talk_window(self):
        acc = ACCOUNTS[0]
        self.assertEqual(x.talk_for(acc, '2026-11-15T13:00:00Z', 24), 'bp26-kamino')
        self.assertIsNone(x.talk_for(acc, '2026-11-14T11:00:00Z', 24))
        self.assertEqual(x.parse_time('Mon Nov 16 12:20:00 +0000 2026').isoformat(), '2026-11-16T12:20:00+00:00')
        self.assertEqual(x.parse_time('2026-11-16T12:20:00Z').isoformat(), '2026-11-16T12:20:00+00:00')


if __name__ == '__main__':
    unittest.main()
