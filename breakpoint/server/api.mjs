import {HttpError,validateEntry,validateStream,validateMedia,validateImage,feedVisible,sourceHealth,makeCalendar,jsonBody,authorized,idPattern,iso,safeUrl} from './core.mjs';
import {marketHealth} from './prices.mjs';

// Public reads are cached at the CDN so polling visitors do not each hit storage.
// Live data: 15 s at the edge. Programme and events: 5 min. Anything authenticated: never cached.
export const CACHE={live:'public, max-age=0, s-maxage=15, stale-while-revalidate=45',static:'public, max-age=60, s-maxage=300, stale-while-revalidate=600',none:'no-store',media:'public, max-age=31536000, s-maxage=31536000, immutable'};
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
// The collector may send an item again with more detail (update: true). That replaces the text only while the item is
// still the collector's own: never after an editor has saved it, and never once withdrawn. Its status stays as it was.
const collectorOwned=v=>v.lastEditor==='ingest'||(v.lastEditor==null&&v.version===1);
async function saveEntry(bucket,entry,expectedVersion,role,update=false){
 const key=`entries/${entry.id}.json`,old=await get(bucket,key);
 if(role==='ingest'&&old){
  if(!update||!collectorOwned(old.value)||old.value.status==='withdrawn'){await indexEntry(bucket,old.value);return {id:entry.id,duplicate:true};}
  entry={...entry,status:old.value.status,occurredAt:old.value.occurredAt,image:entry.image??old.value.image??null};expectedVersion=old.value.version;
 }
 // An editor who removes a picture keeps it removed: the collector never attaches one to that entry again.
 entry={...entry,imageRemoved:role==='editor'?!entry.image&&!!(old?.value.image||old?.value.imageRemoved):!!old?.value.imageRemoved};
 if(old&&expectedVersion!==old.value.version)throw new HttpError(409,'This entry changed. Reload before editing.');
 if(!old&&expectedVersion!=null&&expectedVersion!==0)throw new HttpError(409,'Entry no longer exists');
 const now=new Date().toISOString();const saved={...entry,createdAt:old?.value.createdAt??now,receivedAt:old?.value.receivedAt??now,updatedAt:now,version:(old?.value.version??0)+1,lastEditor:role};
 const result=await put(bucket,key,saved,old?.etag);if(!result)throw new HttpError(409,'Concurrent update. Reload and retry.');
 await bucket.put(`revisions/${entry.id}/${String(saved.version).padStart(6,'0')}.json`,JSON.stringify(saved));
 await indexEntry(bucket,saved);
 return saved;
}
const indexSuffix=saved=>`${String(9999999999999-Date.parse(saved.createdAt)).padStart(13,'0')}-${saved.id}.json`;
async function indexEntry(bucket,saved){const suffix=indexSuffix(saved);await bucket.put(`entry-index/${suffix}`,JSON.stringify({id:saved.id}));if(feedVisible(saved))await bucket.put(`public-index/${suffix}`,JSON.stringify({id:saved.id}));if(saved.kind==='summary'&&feedVisible(saved))await bucket.put(`summary-index/${suffix}`,JSON.stringify({id:saved.id}));if(xSourced(saved)&&feedVisible(saved))await bucket.put(`x-index/${suffix}`,JSON.stringify({id:saved.id}));}
// Session recaps have their own index, so the Watch live list keeps every recap of the event after the latest-60 feed has moved on.
async function summaryPage(bucket,limit=80){const page=await bucket.list({prefix:'summary-index/',limit});const ids=[...new Set(page.objects.map(x=>indexId(x.key)).filter(Boolean))];return ids.length?(await getMany(bucket,ids.map(id=>`entries/${id}.json`))).filter(Boolean).map(x=>x.value):[];}
// "Straight from X": posts from X get their own index, like summaries, so the latest ones stay listed after the
// latest-60 feed moves on. Posts saved before this index existed are indexed once, from the newest 1,000 public
// entries, on the first read after deploy (the marker key records that it ran).
export const X_LIMIT=6;
const X_BACKFILLED='meta/x-index-backfilled.json';
export const xSourced=e=>/^https:\/\/(x|twitter)\.com\//.test(e?.sourceUrl||'');
async function backfillX(bucket){let cursor;for(let i=0;i<4;i++){const page=await entryPage(bucket,true,cursor);await Promise.all(page.entries.filter(e=>xSourced(e)&&Number.isFinite(Date.parse(e.createdAt))).map(e=>bucket.put(`x-index/${indexSuffix(e)}`,JSON.stringify({id:e.id}))));cursor=page.nextCursor;if(!cursor)break;}await bucket.put(X_BACKFILLED,JSON.stringify({at:new Date().toISOString()}));}
async function xPage(bucket,limit=X_LIMIT*3){if(!(await bucket.get(X_BACKFILLED)))await backfillX(bucket);const page=await bucket.list({prefix:'x-index/',limit});const ids=[...new Set(page.objects.map(x=>indexId(x.key)).filter(Boolean))];return ids.length?(await getMany(bucket,ids.map(id=>`entries/${id}.json`))).filter(Boolean).map(x=>x.value):[];}
const byTime=(a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt);
// Pictures: the bytes are stored once under media/<id>.json (ids are content hashes, so a stored picture never changes),
// with a small marker under media-ok/ so an entry can be checked against it without reading the image.
const mediaStored=async(bucket,id)=>!!(await bucket.get(`media-ok/${id}.json`));
async function saveMedia(bucket,raw){const m=validateMedia(raw);if(!(await mediaStored(bucket,m.id))){await bucket.put(`media/${m.id}.json`,JSON.stringify({...m,receivedAt:new Date().toISOString()}));await bucket.put(`media-ok/${m.id}.json`,JSON.stringify({id:m.id,bytes:m.bytes}));}return {media:m.id};}
async function checkedImage(bucket,image){return image&&await mediaStored(bucket,image.id)?image:null;}
// attach: a picture for an entry that is already published (the backfill script). Only when the entry has none and an
// editor has not removed one; the entry's text, status and owner stay as they are.
async function attachImage(bucket,raw){
 if(!raw||!idPattern.test(raw.entryId))throw new HttpError(400,'Invalid attach');
 const image=validateImage(raw.image);if(!image)throw new HttpError(400,'Invalid attach');
 const key=`entries/${raw.entryId}.json`,old=await get(bucket,key);
 if(!old)return {id:raw.entryId,attached:false,reason:'not found'};
 if(old.value.image||old.value.imageRemoved)return {id:raw.entryId,attached:false,reason:'has a picture or one was removed'};
 if(!(await mediaStored(bucket,image.id)))return {id:raw.entryId,attached:false,reason:'picture not stored'};
 const saved={...old.value,image,updatedAt:new Date().toISOString(),version:old.value.version+1};
 if(!(await put(bucket,key,saved,old.etag)))throw new HttpError(409,'Concurrent update. Retry.');
 await bucket.put(`revisions/${saved.id}/${String(saved.version).padStart(6,'0')}.json`,JSON.stringify(saved));
 return {id:raw.entryId,attached:true};
}
async function mediaResponse(bucket,id){
 const o=bucket?await get(bucket,`media/${id}.json`):null;
 if(!o)return new Response('Not found',{status:404,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=60, s-maxage=60'}});
 const bytes=Buffer.from(o.value.data,'base64');
 return new Response(bytes,{headers:{'content-type':o.value.type,'content-length':String(bytes.length),'cache-control':CACHE.media,'x-content-type-options':'nosniff','content-security-policy':"default-src 'none'"}});
}

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
 async function staticData(){const e=await events();return {updatedAt:seed.updatedAt,projects:seed.projects,speakers:seed.speakers,organizations:seed.organizations??{},xAvatars:seed.xAvatars??[],sessions:seed.sessions,breaks:seed.breaks??[],events:e.events,eventsSource:e.source,eventsCheckedAt:e.checkedAt};}
 async function prices(){if(!loadPrices)return null;try{return await loadPrices();}catch{return null;}}
 async function liveData(bucket){
  let entries=[],nextCursor=null,heartbeats=[],streams=[],sessions=[],recaps=[],xs=[],storage='not-configured';
  const pricesPromise=prices();
  if(bucket){try{[{entries,nextCursor},heartbeats,streams,sessions,recaps,xs]=await Promise.all([entryPage(bucket,true,undefined,LIVE_LIMIT),list(bucket,'health/'),list(bucket,'streams/'),list(bucket,'sessions/'),summaryPage(bucket),xPage(bucket).catch(()=>[])]);storage='ready';}catch{entries=[];nextCursor=null;heartbeats=[];streams=[];sessions=[];recaps=[];xs=[];storage='unavailable';}}
  const xPosts=[...new Map([...xs,...entries].filter(e=>xSourced(e)&&feedVisible(e)&&e.status!=='withdrawn').map(e=>[e.id,e])).values()].sort(byTime).slice(0,X_LIMIT);
  const summaries=[...new Map([...recaps,...entries].filter(e=>e.kind==='summary'&&feedVisible(e)&&e.status!=='withdrawn').map(e=>[e.id,e])).values()].sort(byTime);
  const market=await pricesPromise;
  const health=Object.fromEntries(HEALTH_IDS.map(id=>[id,sourceHealth(heartbeats.find(h=>h.id===id))]));
  if(loadPrices)health.market=marketHealth(market);
  return {nextCursor,entries:[...seed.entries,...entries.filter(feedVisible)].sort(byTime),summaries,xPosts,streams:seed.streams.map(s=>streams.find(x=>x.id===s.id)??s),sessionOverrides:sessions,health,prices:market?{source:market.source,checkedAt:market.checkedAt,stale:market.stale,prices:market.prices}:null,storage,serverTime:new Date().toISOString()};
 }
 return async function api(request,env){
  const url=new URL(request.url);let path=url.pathname;
  if(basePath&&path.startsWith(basePath+'/'))path=path.slice(basePath.length);
  const bucket=env.BUCKET;
  try{
   if(request.method==='GET'){
    if(path==='/api/static')return json(await staticData(),200,CACHE.static);
    {const m=/^\/api\/media\/([fx][a-f0-9]{32})(?:\.(?:webp|jpg))?$/.exec(path);if(m)return await mediaResponse(bucket,m[1]);}
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
    if(body.media)results.push(await saveMedia(bucket,body.media));
    if(body.entries){if(!Array.isArray(body.entries)||body.entries.length>30)throw new HttpError(400,'At most 30 entries per batch');for(const raw of body.entries){const entry=validateEntry({...raw,status:raw.status==='provisional'&&env.AUTO_PUBLISH_PROVISIONAL==='true'?'provisional':'draft'},projectIds);entry.image=await checkedImage(bucket,entry.image);results.push(await saveEntry(bucket,entry,null,'ingest',raw.update===true));}}
    if(body.attach){if(!Array.isArray(body.attach)||body.attach.length>30)throw new HttpError(400,'At most 30 pictures per batch');for(const raw of body.attach)results.push(await attachImage(bucket,raw));}
    if(body.transcript){const t=body.transcript;if(!idPattern.test(t.id)||!idPattern.test(t.sessionId)||!iso(t.at)||!safeUrl(t.sourceUrl)||typeof t.stage!=='string'||t.stage.length>80||typeof t.text!=='string'||t.text.length>50000)throw new HttpError(400,'Invalid transcript');await put(bucket,`transcripts/${t.sessionId}/${t.id}.json`,{id:t.id,sessionId:t.sessionId,stage:t.stage,text:t.text,at:t.at,receivedAt:new Date().toISOString(),sourceUrl:t.sourceUrl});}
    if(body.heartbeat){const h=body.heartbeat;if(!HEALTH_IDS.includes(h.id)||!['live','error','paused','ready'].includes(h.state))throw new HttpError(400,'Invalid heartbeat');const extra={};for(const k of ['sessionId','nextSessionId'])if(h[k]!=null){if(!idPattern.test(String(h[k])))throw new HttpError(400,'Invalid heartbeat');extra[k]=String(h[k]);}if(h.delayMinutes!=null){const d=Number(h.delayMinutes);if(!Number.isFinite(d)||Math.abs(d)>240)throw new HttpError(400,'Invalid heartbeat');extra.delayMinutes=Math.round(d);}await bucket.put(`health/${h.id}.json`,JSON.stringify({id:h.id,state:h.state,at:new Date().toISOString(),message:String(h.message??'').slice(0,200),...extra}));}
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
