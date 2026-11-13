import {HttpError,validateEntry,validateStream,feedVisible,sourceHealth,makeCalendar,jsonBody,authorized,idPattern,iso,safeUrl} from './core.mjs';
import {marketHealth} from './prices.mjs';

// Public reads are cached at the CDN so polling visitors do not each hit storage.
// Live data: 15 s at the edge. Programme and events: 5 min. Anything authenticated: never cached.
export const CACHE={live:'public, max-age=0, s-maxage=15, stale-while-revalidate=45',static:'public, max-age=60, s-maxage=300, stale-while-revalidate=600',none:'no-store'};
export const LIVE_LIMIT=60;
const HEALTH_IDS=['main','royal','lparmy','x','market'];
const json=(data,status=200,cache=CACHE.none)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':cache,'x-content-type-options':'nosniff'}});
const get=async(bucket,key)=>{const object=await bucket.get(key);return object?{value:await object.json(),etag:object.etag}:null;};
async function getMany(bucket,keys){if(!keys.length)return [];const objects=bucket.getMany?await bucket.getMany(keys):await Promise.all(keys.map(k=>bucket.get(k)));return Promise.all(objects.map(async o=>o?{value:await o.json(),etag:o.etag}:null));}
async function list(bucket,prefix,limit=250){const items=await bucket.list({prefix,limit});return (await getMany(bucket,items.objects.map(x=>x.key))).filter(Boolean).map(x=>x.value);}
// Index keys are `<inverted ms timestamp>-<entry id>.json`, so the id can be read from the key without another storage read.
const indexId=key=>{const m=/\/\d{13}-([a-zA-Z0-9_-]{1,100})\.json$/.exec(key);return m?m[1]:null;};
async function entryPage(bucket,publicOnly=false,cursor,limit=250){
 const page=await bucket.list({prefix:publicOnly?'public-index/':'entry-index/',limit,...(cursor?{cursor}:{})});
 const keys=page.objects.map(x=>x.key),parsed=keys.map(indexId),unknown=keys.filter((_,i)=>!parsed[i]);
 const refs=unknown.length?(await getMany(bucket,unknown)).filter(Boolean).map(x=>x.value.id):[];
 const ids=[...new Set([...parsed.filter(Boolean),...refs])];
 const entries=(await getMany(bucket,ids.map(id=>`entries/${id}.json`))).filter(Boolean).map(x=>x.value);
 return {entries:publicOnly?entries.filter(feedVisible):entries,nextCursor:page.truncated?page.cursor:null};
}
async function put(bucket,key,data,etag){return bucket.put(key,JSON.stringify(data),{httpMetadata:{contentType:'application/json'},onlyIf:etag?{etagMatches:etag}:{etagDoesNotMatch:'*'}});}
async function saveEntry(bucket,entry,expectedVersion,role){
 const key=`entries/${entry.id}.json`,old=await get(bucket,key);
 if(role==='ingest'&&old){await indexEntry(bucket,old.value);return {id:entry.id,duplicate:true};}
 if(old&&expectedVersion!==old.value.version)throw new HttpError(409,'This entry changed. Reload before editing.');
 if(!old&&expectedVersion!=null&&expectedVersion!==0)throw new HttpError(409,'Entry no longer exists');
 const now=new Date().toISOString();const saved={...entry,createdAt:old?.value.createdAt??now,receivedAt:old?.value.receivedAt??now,updatedAt:now,version:(old?.value.version??0)+1};
 const result=await put(bucket,key,saved,old?.etag);if(!result)throw new HttpError(409,'Concurrent update. Reload and retry.');
 await bucket.put(`revisions/${entry.id}/${String(saved.version).padStart(6,'0')}.json`,JSON.stringify(saved));
 await indexEntry(bucket,saved);
 return saved;
}
async function indexEntry(bucket,saved){const suffix=`${String(9999999999999-Date.parse(saved.createdAt)).padStart(13,'0')}-${saved.id}.json`;await bucket.put(`entry-index/${suffix}`,JSON.stringify({id:saved.id}));if(feedVisible(saved))await bucket.put(`public-index/${suffix}`,JSON.stringify({id:saved.id}));}
const byTime=(a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt);

/**
 * createApi(seed, {basePath, loadEvents})
 * basePath: URL prefix the app is mounted under, e.g. '/breakpoint'.
 * loadEvents: async () => ({events, source, checkedAt, error?}); falls back to seed.events on failure.
 * error, when present, is the reason live listings could not be refreshed (shown in /api/health).
 * loadPrices: async () => ({source, checkedAt, stale, error, prices}); token prices for /api/live (see prices.mjs).
 * @param {any} seed
 * @param {{basePath?: string, loadEvents?: () => Promise<{events: any[], source?: string, checkedAt?: string, error?: string}>, loadPrices?: () => Promise<any>}} [options]
 * @returns {(request: Request, env: {BUCKET?: any, EDITOR_TOKEN?: string, INGEST_TOKEN?: string, AUTO_PUBLISH_PROVISIONAL?: string}) => Promise<Response>}
 */
export function createApi(seed,{basePath='',loadEvents,loadPrices}={}){
 const projectIds=seed.projects.map(p=>p.id);
 async function events(){
  let error;
  if(loadEvents){try{const r=await loadEvents();if(r&&Array.isArray(r.events)&&r.events.length)return r;error='No events returned';}catch(e){error=String(e?.message??e).slice(0,200);}}
  return {events:seed.events,source:'seed',checkedAt:seed.updatedAt,error};
 }
 async function staticData(){const e=await events();return {updatedAt:seed.updatedAt,projects:seed.projects,speakers:seed.speakers,sessions:seed.sessions,breaks:seed.breaks??[],events:e.events,eventsSource:e.source,eventsCheckedAt:e.checkedAt};}
 async function prices(){if(!loadPrices)return null;try{return await loadPrices();}catch{return null;}}
 async function liveData(bucket){
  let entries=[],nextCursor=null,heartbeats=[],streams=[],sessions=[],storage='not-configured';
  const pricesPromise=prices();
  if(bucket){try{[{entries,nextCursor},heartbeats,streams,sessions]=await Promise.all([entryPage(bucket,true,undefined,LIVE_LIMIT),list(bucket,'health/'),list(bucket,'streams/'),list(bucket,'sessions/')]);storage='ready';}catch{entries=[];nextCursor=null;heartbeats=[];streams=[];sessions=[];storage='unavailable';}}
  const market=await pricesPromise;
  const health=Object.fromEntries(HEALTH_IDS.map(id=>[id,sourceHealth(heartbeats.find(h=>h.id===id))]));
  if(loadPrices)health.market=marketHealth(market);
  return {nextCursor,entries:[...seed.entries,...entries.filter(feedVisible)].sort(byTime),streams:seed.streams.map(s=>streams.find(x=>x.id===s.id)??s),sessionOverrides:sessions,health,prices:market?{source:market.source,checkedAt:market.checkedAt,stale:market.stale,prices:market.prices}:null,storage,serverTime:new Date().toISOString()};
 }
 return async function api(request,env){
  const url=new URL(request.url);let path=url.pathname;
  if(basePath&&path.startsWith(basePath+'/'))path=path.slice(basePath.length);
  const bucket=env.BUCKET;
  try{
   if(request.method==='GET'){
    if(path==='/api/static')return json(await staticData(),200,CACHE.static);
    if(path==='/api/live')return json(await liveData(bucket),200,CACHE.live);
    if(path==='/api/bootstrap'){const [s,l]=await Promise.all([staticData(),liveData(bucket)]);const {sessionOverrides,...rest}=l;return json({...s,...rest,sessions:s.sessions.map(x=>sessionOverrides.find(o=>o.id===x.id)??x)},200,CACHE.live);}
    if(path==='/api/calendar'){const id=url.searchParams.get('id')??'';const event=(await events()).events.find(e=>e.id===id);if(!event)throw new HttpError(404,'Event not found');return new Response(makeCalendar(event),{headers:{'content-type':'text/calendar; charset=utf-8','content-disposition':`attachment; filename="${event.id.replace(/[^a-zA-Z0-9_-]/g,'')}.ics"`,'cache-control':CACHE.static}});}
    if(path==='/api/feed'){if(!bucket)throw new HttpError(503,'Durable storage is not connected');const cursor=url.searchParams.get('cursor');if(cursor&&cursor.length>2000)throw new HttpError(400,'Invalid cursor');return json(await entryPage(bucket,true,cursor),200,CACHE.live);}
    if(path==='/api/health'){const e=await events();return json({storage:!!bucket,editorConfigured:!!env.EDITOR_TOKEN,collectorConfigured:!!env.INGEST_TOKEN,events:{source:e.source,checkedAt:e.checkedAt,count:e.events.length,error:e.error??null}});}
   }
   const isEditor=await authorized(request,env.EDITOR_TOKEN);const isCollector=await authorized(request,env.INGEST_TOKEN);
   if(!isEditor&&!isCollector)throw new HttpError(401,'Editor or collector authentication required');
   if(!bucket)throw new HttpError(503,'Durable storage is not connected');
   if(path==='/api/ingest'&&request.method==='POST'){
    const body=await jsonBody(request);const results=[];
    if(body.entries){if(!Array.isArray(body.entries)||body.entries.length>30)throw new HttpError(400,'At most 30 entries per batch');for(const raw of body.entries){const entry=validateEntry({...raw,status:raw.status==='provisional'&&env.AUTO_PUBLISH_PROVISIONAL==='true'?'provisional':'draft'},projectIds);results.push(await saveEntry(bucket,entry,null,'ingest'));}}
    if(body.transcript){const t=body.transcript;if(!idPattern.test(t.id)||!idPattern.test(t.sessionId)||!iso(t.at)||!safeUrl(t.sourceUrl)||typeof t.stage!=='string'||t.stage.length>80||typeof t.text!=='string'||t.text.length>50000)throw new HttpError(400,'Invalid transcript');await put(bucket,`transcripts/${t.sessionId}/${t.id}.json`,{id:t.id,sessionId:t.sessionId,stage:t.stage,text:t.text,at:t.at,receivedAt:new Date().toISOString(),sourceUrl:t.sourceUrl});}
    if(body.heartbeat){const h=body.heartbeat;if(!HEALTH_IDS.includes(h.id)||!['live','error','paused','ready'].includes(h.state))throw new HttpError(400,'Invalid heartbeat');await bucket.put(`health/${h.id}.json`,JSON.stringify({id:h.id,state:h.state,at:new Date().toISOString(),message:String(h.message??'').slice(0,200)}));}
    return json({ok:true,results});
   }
   if(!isEditor)throw new HttpError(403,'Editor access required');
   if(path==='/api/admin'&&request.method==='GET')return json({entries:(await entryPage(bucket)).entries,streams:await list(bucket,'streams/'),sessions:await list(bucket,'sessions/')});
   if(path==='/api/admin/entry'&&request.method==='POST'){const body=await jsonBody(request);return json(await saveEntry(bucket,validateEntry(body,projectIds),body.version,'editor'));}
   if(path==='/api/admin/stream'&&request.method==='POST'){const stream=validateStream(await jsonBody(request));await bucket.put(`streams/${stream.id}.json`,JSON.stringify(stream));return json(stream);}
   if(path==='/api/admin/session'&&request.method==='POST'){
    const raw=await jsonBody(request),base=seed.sessions.find(x=>x.id===raw.id);if(!base||!/^2026-11-(16|17)$/.test(raw.date)||!/^\d\d:\d\d$/.test(raw.time)||!iso(`${raw.date}T${raw.time}:00Z`))throw new HttpError(400,'Use a listed session and valid conference time');
    const s={...base,date:raw.date,time:raw.time,dateVerified:true,dateNote:'Date confirmed by editor against official schedule.'};await bucket.put(`sessions/${s.id}.json`,JSON.stringify(s));return json(s);
   }
   if(path==='/api/admin/transcripts'&&request.method==='GET'){const id=url.searchParams.get('session');if(!idPattern.test(id??''))throw new HttpError(400,'Invalid session');return json(await list(bucket,`transcripts/${id}/`,1000));}
   throw new HttpError(404,'API route not found');
  }catch(error){return json({error:error instanceof HttpError?error.message:'Service temporarily unavailable'},error.status??503);}
 };
}
