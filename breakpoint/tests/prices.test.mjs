import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {priceTargets,normalizePrices,tokenPrices,marketHealth,_resetPriceCache,PRICE_API,PRICE_TTL_MS,PRICE_STALE_LIMIT_MS} from '../server/prices.mjs';
import {USER_AGENT} from '../server/luma.mjs';
import {createApi} from '../server/api.mjs';

const seed=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url)));
const projects=[
 {id:'jupiter',symbol:'JUP',mintAddress:'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'},
 {id:'kamino',symbol:'KMNO',mintAddress:'KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS'},
 {id:'noticker',symbol:null,mintAddress:'So11111111111111111111111111111111111111112'},
 {id:'nomint',symbol:'XYZ',mintAddress:null},
 {id:'badmint',symbol:'BAD',mintAddress:'not-a-mint'},
];
const body={
 JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:{usdPrice:0.26,priceChange24h:-0.31,liquidity:5510284},
 KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS:{usdPrice:0.0297,priceChange24h:null,liquidity:2140815},
};

test('only projects with a ticker and a well-formed verified mint are priced',()=>{
 assert.deepEqual(priceTargets(projects).map(t=>t.id),['jupiter','kamino']);
});
test('every ticker in the seed with a mint is a valid target, and only those',()=>{
 const ids=priceTargets(seed.projects).map(t=>t.id).sort();
 assert.deepEqual(ids,['jito','jupiter','kamino','meteora','solana']);
 for(const p of seed.projects.filter(p=>p.mintAddress))assert.match(p.mintSourceUrl,/^https:\/\//);
});
test('normalise keeps real prices and drops missing, zero or malformed rows',()=>{
 const t=priceTargets(projects);
 assert.deepEqual(normalizePrices(t,body),{jupiter:{symbol:'JUP',mint:projects[0].mintAddress,usd:0.26,change24h:-0.31,liquidity:5510284},kamino:{symbol:'KMNO',mint:projects[1].mintAddress,usd:0.0297,change24h:null,liquidity:2140815}});
 assert.deepEqual(normalizePrices(t,{[projects[0].mintAddress]:{usdPrice:0},[projects[1].mintAddress]:{usdPrice:'1'}}),{});
 assert.deepEqual(normalizePrices(t,null),{});
});
test('requests Jupiter once per TTL with the guide user agent and optional key',async()=>{
 _resetPriceCache();const calls=[];
 const fetchImpl=async(url,init)=>{calls.push({url,init});return Response.json(body);};
 const a=await tokenPrices(projects,{fetchImpl,now:0,apiKey:'k1'});
 assert.equal(a.source,'jupiter');assert.equal(a.stale,false);assert.equal(a.error,null);assert.equal(a.prices.jupiter.usd,0.26);
 assert.ok(calls[0].url.startsWith(PRICE_API+'?ids='));
 assert.equal(new URL(calls[0].url).searchParams.get('ids'),projects[0].mintAddress+','+projects[1].mintAddress);
 assert.equal(calls[0].init.headers['user-agent'],USER_AGENT);assert.equal(calls[0].init.headers['x-api-key'],'k1');
 const b=await tokenPrices(projects,{fetchImpl,now:PRICE_TTL_MS-1});assert.equal(b,a);assert.equal(calls.length,1);
 _resetPriceCache();await tokenPrices(projects,{fetchImpl,now:0});assert.equal('x-api-key' in calls[1].init.headers,false);
});
test('failures serve the last good prices briefly, marked stale, then nothing',async()=>{
 _resetPriceCache();let fail=false;
 const fetchImpl=async()=>fail?new Response('limited',{status:429}):Response.json(body);
 await tokenPrices(projects,{fetchImpl,now:0});fail=true;
 const stale=await tokenPrices(projects,{fetchImpl,now:PRICE_TTL_MS+1});
 assert.equal(stale.stale,true);assert.match(stale.error,/429/);assert.equal(stale.prices.jupiter.usd,0.26);
 const gone=await tokenPrices(projects,{fetchImpl,now:PRICE_STALE_LIMIT_MS+1});
 assert.deepEqual(gone.prices,{});assert.match(gone.error,/429/);assert.equal(gone.checkedAt,null);
 _resetPriceCache();
 const empty=await tokenPrices(projects,{fetchImpl:async()=>Response.json({}),now:0});
 assert.deepEqual(empty.prices,{});assert.match(empty.error,/no prices/);
 const none=await tokenPrices([{id:'x',symbol:'X'}],{fetchImpl:async()=>{throw new Error('should not be called');},now:0});
 assert.match(none.error,/No verified token mints/);
});
test('market health reflects real fetches',()=>{
 assert.equal(marketHealth(null).state,'not-connected');
 assert.equal(marketHealth({prices:{},error:'x'}).state,'error');
 assert.equal(marketHealth({prices:{a:{}},stale:true,checkedAt:'t'}).state,'stale');
 const live=marketHealth({prices:{a:{},b:{}},stale:false,checkedAt:'t'});assert.equal(live.state,'live');assert.equal(live.lastSeen,'t');assert.match(live.message,/2 tokens/);
});
test('/api/live carries prices and market health; coverage stays separate',async()=>{
 const req=(p)=>new Request('https://x.test/breakpoint'+p);
 const result={source:'jupiter',checkedAt:'2026-11-13T18:00:00.000Z',stale:false,error:null,prices:{jupiter:{symbol:'JUP',usd:0.26,change24h:-0.3}}};
 let api=createApi(seed,{basePath:'/breakpoint',loadPrices:async()=>result});
 let live=await(await api(req('/api/live'),{})).json();
 assert.deepEqual(live.prices,{source:'jupiter',checkedAt:result.checkedAt,stale:false,prices:result.prices});
 assert.equal(live.health.market.state,'live');assert.equal(live.health.main.state,'not-connected');
 api=createApi(seed,{basePath:'/breakpoint',loadPrices:async()=>{throw new Error('down');}});
 live=await(await api(req('/api/live'),{})).json();assert.equal(live.prices,null);assert.equal(live.health.market.state,'not-connected');
 api=createApi(seed,{basePath:'/breakpoint'});
 live=await(await api(req('/api/live'),{})).json();assert.equal(live.prices,null);assert.equal(live.health.market.state,'not-connected');
});
