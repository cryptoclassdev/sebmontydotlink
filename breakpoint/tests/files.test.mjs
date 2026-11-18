import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileBucket} from '../server/files.mjs';

const dir=()=>fs.mkdtempSync(path.join(os.tmpdir(),'bp-files-'));

test('file bucket keeps records across a restart, with their etags',async()=>{const d=dir();const a=fileBucket(d);const {etag}=await a.put('entries/one.json',JSON.stringify({id:'one'}));await a.put('streams/main.json','{"id":"main"}');const b=fileBucket(d);const o=await b.get('entries/one.json');assert.equal(o.etag,etag);assert.deepEqual(await o.json(),{id:'one'});assert.deepEqual(b.keys().sort(),['entries/one.json','streams/main.json']);assert.equal(fs.readdirSync(d).filter(f=>f.endsWith('.tmp')).length,0);});
test('file bucket honours etag preconditions',async()=>{const b=fileBucket(dir());const first=await b.put('k','1',{onlyIf:{etagDoesNotMatch:'*'}});assert.ok(first);assert.equal(await b.put('k','2',{onlyIf:{etagDoesNotMatch:'*'}}),null);assert.equal(await b.put('k','2',{onlyIf:{etagMatches:'stale'}}),null);assert.ok(await b.put('k','2',{onlyIf:{etagMatches:first.etag}}));assert.equal(await(await b.get('k')).json(),2);});
test('file bucket lists by prefix in byte order and pages with a cursor',async()=>{const b=fileBucket(dir());for(const k of ['x-index/2','x-index/1','x-index/3','x-indexes/9','w/1','entry-index/0'])await b.put(k,'{}');let p=await b.list({prefix:'x-index/',limit:2});assert.deepEqual(p.objects.map(o=>o.key),['x-index/1','x-index/2']);assert.equal(p.truncated,true);p=await b.list({prefix:'x-index/',limit:2,cursor:p.cursor});assert.deepEqual(p.objects.map(o=>o.key),['x-index/3']);assert.equal(p.truncated,false);assert.deepEqual((await b.list({prefix:'none/'})).objects,[]);assert.deepEqual((await b.getMany(['w/1','missing'])).map(x=>x&&'found'),['found',null]);});
test('file bucket ignores a damaged file and loads the rest',async()=>{const d=dir();const a=fileBucket(d);await a.put('good','{"ok":true}');fs.writeFileSync(path.join(d,'bad.rec'),'{not json');const b=fileBucket(d);assert.deepEqual(b.keys(),['good']);});
