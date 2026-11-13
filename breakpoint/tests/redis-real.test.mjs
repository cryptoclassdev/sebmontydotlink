// Runs the Upstash adapter (including its Lua conditional-write script) against a real
// local redis-server, translating Upstash's REST calls into RESP. Skipped when redis-server
// is not installed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import {upstashBucket} from '../server/upstash.mjs';
import {createApi} from '../server/api.mjs';

let bin=null;try{bin=execFileSync('sh',['-c','command -v redis-server'],{encoding:'utf8'}).trim()||null;}catch{}
const seed=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url)));

function encode(args){return `*${args.length}\r\n`+args.map(a=>{const s=String(a);return `$${Buffer.byteLength(s)}\r\n${s}\r\n`;}).join('');}
function parse(buf,i=0){const t=String.fromCharCode(buf[i]);const end=buf.indexOf('\r\n',i);const line=buf.toString('utf8',i+1,end);if(t==='+')return [line,end+2];if(t==='-')return [{error:line},end+2];if(t===':')return [Number(line),end+2];if(t==='$'){const n=Number(line);if(n<0)return [null,end+2];return [buf.toString('utf8',end+2,end+2+n),end+2+n+2];}if(t==='*'){const n=Number(line);if(n<0)return [null,end+2];const out=[];let j=end+2;for(let k=0;k<n;k++){const [v,next]=parse(buf,j);out.push(v);j=next;}return [out,j];}throw new Error('bad reply');}
function client(port){return new Promise((resolve,reject)=>{const sock=net.connect(port,'127.0.0.1');let buf=Buffer.alloc(0);const waiting=[];sock.once('error',reject);sock.once('connect',()=>{sock.off('error',reject);sock.on('error',e=>{while(waiting.length)waiting.shift().reject(e);});resolve({send:(args)=>new Promise((res,rej)=>{waiting.push({resolve:res,reject:rej});sock.write(encode(args));}),close:()=>sock.destroy()});});sock.on('data',d=>{buf=Buffer.concat([buf,d]);while(waiting.length){let parsed;try{parsed=parse(buf);}catch{break;}buf=buf.subarray(parsed[1]);waiting.shift().resolve(parsed[0]);}});});}

test('Upstash adapter and API work against real Redis',{skip:!bin&&'redis-server not installed'},async()=>{
 const port=20000+Math.floor(Math.random()*20000);
 const server=spawn(bin,['--port',String(port),'--save','','--appendonly','no'],{stdio:'ignore'});
 try{
  let c;for(let i=0;i<50&&!c;i++){try{c=await client(port);}catch{await new Promise(r=>setTimeout(r,100));}}assert.ok(c,'redis-server did not start');assert.equal(await c.send(['PING']),'PONG');
  const fetchImpl=async(url,init)=>{const body=JSON.parse(init.body);if(url.endsWith('/pipeline')){const out=[];for(const cmd of body){const r=await c.send(cmd);out.push(r&&r.error?{error:r.error}:{result:r});}return Response.json(out);}const r=await c.send(body);return Response.json(r&&r.error?{error:r.error}:{result:r});};
  const bucket=upstashBucket({url:'https://local',token:'t',fetchImpl});
  // Conditional writes
  const a=await bucket.put('entries/x.json','{"v":1}',{onlyIf:{etagDoesNotMatch:'*'}});assert.ok(a?.etag);
  assert.equal(await bucket.put('entries/x.json','{"v":2}',{onlyIf:{etagDoesNotMatch:'*'}}),null);
  assert.equal(await bucket.put('entries/x.json','{"v":2}',{onlyIf:{etagMatches:'wrong'}}),null);
  const b=await bucket.put('entries/x.json','{"v":2}',{onlyIf:{etagMatches:a.etag}});assert.ok(b?.etag&&b.etag!==a.etag);
  assert.deepEqual(await (await bucket.get('entries/x.json')).json(),{v:2});
  assert.equal(await bucket.get('entries/missing.json'),null);
  // Prefix listing with cursors
  for(let i=0;i<7;i++)await bucket.put(`health/h${i}.json`,JSON.stringify({i}));
  await bucket.put('healthy/other.json','{}');
  const p1=await bucket.list({prefix:'health/',limit:4});assert.equal(p1.objects.length,4);assert.equal(p1.truncated,true);
  const p2=await bucket.list({prefix:'health/',limit:4,cursor:p1.cursor});assert.deepEqual(p2.objects.map(o=>o.key),['health/h4.json','health/h5.json','health/h6.json']);assert.equal(p2.truncated,false);
  const many=await bucket.getMany(['health/h0.json','nope','health/h6.json']);assert.equal(many[1],null);assert.deepEqual(await many[2].json(),{i:6});
  // Full API flow on real storage
  const api=createApi(seed,{basePath:'/breakpoint'});const env={BUCKET:bucket,EDITOR_TOKEN:'e',INGEST_TOKEN:'i'};
  const call=(path,body,token)=>api(new Request('https://t/breakpoint'+path,{method:body?'POST':'GET',headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);
  const entry={id:'real-1',kind:'announcement',status:'verified',title:'Real',body:'Body',excerpt:'Body',sourceUrl:'https://solana.com/breakpoint',sourceName:'Fixture',occurredAt:new Date().toISOString(),projectIds:[],takeaways:[]};
  const saved=await(await call('/api/admin/entry',entry,'e')).json();assert.equal(saved.version,1);
  assert.equal((await call('/api/admin/entry',{...saved,title:'Edit'},'e')).status,200);
  assert.equal((await call('/api/admin/entry',{...saved,title:'Stale'},'e')).status,409);
  const live=await(await call('/api/live')).json();assert.equal(live.storage,'ready');assert.equal(live.entries.find(x=>x.id==='real-1').title,'Edit');
  c.close();
 }finally{server.kill();}
});
