import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeTweet,createTweetEmbeds,tweetIdOf,embedToken} from '../server/tweets.mjs';
import {createApi} from '../server/api.mjs';
import {upstashBucket} from '../server/upstash.mjs';
import {fakeUpstash} from './fake-upstash.mjs';

// Real responses from X's embed endpoint for posts the X monitor published on 16 Nov 2026.
const fixture=name=>JSON.parse(fs.readFileSync(new URL(`./fixtures/x/${name}.json`,import.meta.url)));
const seed=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url)));
const bucket=()=>upstashBucket({url:'https://fake.upstash.io',token:'t',fetchImpl:fakeUpstash().fetch});
const ok=body=>({ok:true,status:200,json:async()=>body});
const entry=(id,sourceUrl)=>({id,kind:'announcement',status:'verified',title:'Fixture',body:'Fixture',excerpt:'Fixture',sourceUrl,sourceName:'Fixture',occurredAt:new Date().toISOString(),projectIds:[],takeaways:[],novelty:'unknown',tokenImpact:'none'});

test('post ids come only from x.com and twitter.com status links', () => {
 assert.equal(tweetIdOf('https://x.com/cloudflare/status/2122281760444580295'),'2122281760444580295');
 assert.equal(tweetIdOf('https://twitter.com/solana/status/2122281304792125482?s=20'),'2122281304792125482');
 assert.equal(tweetIdOf('https://evil.example/x.com/a/status/2122281304792125482'),null);
 assert.equal(tweetIdOf('http://x.com/a/status/2122281304792125482'),null);
 assert.equal(tweetIdOf('https://www.youtube.com/watch?v=l8Sk-jInOHo'),null);
 assert.equal(embedToken('2122281760444580295'),'557ceuej99r');
});

test('a photo post keeps author, avatar, linked cashtag and the photo', () => {
 const t=normalizeTweet(fixture('photo'));
 assert.equal(t.url,'https://x.com/kashdhanda/status/2122278282326659225');
 assert.deepEqual(t.author,{name:'kash',handle:'kashdhanda',avatar:'https://pbs.twimg.com/profile_images/1921122530405863425/wTbPEY2B_200x200.jpg',square:false,verified:'blue'});
 assert.ok(t.text.some(s=>s.text==='$USDGO'&&s.href==='https://x.com/search?q=%24USDGO'));
 assert.ok(!t.text.some(s=>s.text.includes('t.co')),'the trailing media link is dropped');
 assert.equal(t.media.length,1);assert.equal(t.media[0].type,'photo');assert.equal(t.media[0].width,1206);
});

test('a video post has its poster and a mid-bitrate MP4; mentions link to X', () => {
 const t=normalizeTweet(fixture('video'));
 assert.equal(t.author.verified,'business');assert.equal(t.author.square,true);
 assert.equal(t.media[0].type,'video');
 assert.match(t.media[0].image,/^https:\/\/pbs\.twimg\.com\//);
 assert.match(t.media[0].video,/^https:\/\/video\.twimg\.com\/.*640x360/);
 assert.equal(t.media[0].durationMs,25500);
 assert.deepEqual(t.text.filter(s=>s.href).map(s=>s.text),['@MoneyGram','@solflare']);
});

test('quoted posts, link previews, long posts and deleted posts', () => {
 const q=normalizeTweet(fixture('quote'));
 assert.equal(q.quoted.author.handle,'solana');assert.equal(q.quoted.quoted,undefined);assert.ok(q.quoted.media.length<=1);
 const c=normalizeTweet(fixture('card'));
 assert.equal(c.card.url,'https://cfl.re/4eHmAK6');assert.equal(c.card.title,'Kitesurf is now open source');assert.equal(c.card.domain,'blog.cloudflare.com');assert.equal(c.card.large,true);assert.match(c.card.image,/^https:\/\/pbs\.twimg\.com\/card_img\//);
 assert.equal(normalizeTweet(fixture('long')).truncated,true);
 assert.deepEqual(normalizeTweet(fixture('deleted')),{deleted:true});
 assert.equal(normalizeTweet({}),null);
});

test('embeds are fetched once, stored, and shared with a fresh server instance', async () => {
 const store=bucket();let calls=0;
 const fetchImpl=async url=>{calls++;assert.match(url,/^https:\/\/cdn\.syndication\.twimg\.com\/tweet-result\?id=2122278282326659225&lang=en&token=/);return ok(fixture('photo'));};
 const entries=[entry('xw-1','https://x.com/kashdhanda/status/2122278282326659225'),entry('yt-1','https://www.youtube.com/watch?v=l8Sk-jInOHo')];
 const first=await createTweetEmbeds({fetchImpl})(store,entries);
 assert.equal(calls,1);assert.equal(first[0].embed.author.handle,'kashdhanda');assert.equal(first[1].embed,undefined);
 assert.equal(entries[0].embed,undefined,'entries are not mutated');
 const second=await createTweetEmbeds({fetchImpl})(store,entries);
 assert.equal(calls,1,'second instance reads storage');assert.equal(second[0].embed.id,'2122278282326659225');
});

test('a failed fetch leaves the entry as it was and waits 10 minutes before retrying', async () => {
 const store=bucket();let calls=0,clock=Date.parse('2026-11-16T12:00:00Z');
 const attach=createTweetEmbeds({fetchImpl:async()=>{calls++;return {ok:false,status:503,json:async()=>({})};},now:()=>clock});
 const entries=[entry('xw-1','https://x.com/solana/status/2122281304792125482')];
 assert.equal((await attach(store,entries))[0].embed,undefined);
 await attach(store,entries);assert.equal(calls,1);
 clock+=11*60*1000;await attach(store,entries);assert.equal(calls,2);
 const timeout=createTweetEmbeds({fetchImpl:async()=>{throw new Error('network');}});
 assert.equal((await timeout(null,entries))[0].embed,undefined);
});

test('/api/live (feed and Straight from X) and /api/feed carry embeds, and a broken embed step never breaks them', async () => {
 const store=bucket(),env={BUCKET:store,INGEST_TOKEN:'ingest-test',AUTO_PUBLISH_PROVISIONAL:'true'};
 const post=entry('xw-2122278282326659225','https://x.com/kashdhanda/status/2122278282326659225');
 const call=(api,path,body)=>api(new Request('https://test.example/breakpoint'+path,{method:body?'POST':'GET',headers:body?{'content-type':'application/json',authorization:'Bearer ingest-test'}:{},...(body?{body:JSON.stringify(body)}:{})}),env);
 const api=createApi(seed,{basePath:'/breakpoint',attachEmbeds:createTweetEmbeds({fetchImpl:async()=>ok(fixture('photo'))})});
 assert.equal((await call(api,'/api/ingest',{entries:[{...post,status:'provisional'}]})).status,200);
 const live=await (await call(api,'/api/live')).json();
 assert.equal(live.entries.find(e=>e.id===post.id).embed.author.handle,'kashdhanda');
 assert.equal(live.xPosts.find(e=>e.id===post.id).embed.author.handle,'kashdhanda','Straight from X gets the embed too');
 const feed=await (await call(api,'/api/feed')).json();
 assert.equal(feed.entries.find(e=>e.id===post.id).embed.author.handle,'kashdhanda');
 const broken=createApi(seed,{basePath:'/breakpoint',attachEmbeds:async()=>{throw new Error('boom');}});
 const res=await call(broken,'/api/live');assert.equal(res.status,200);
 assert.equal((await res.json()).entries.find(e=>e.id===post.id).embed,undefined);
});
