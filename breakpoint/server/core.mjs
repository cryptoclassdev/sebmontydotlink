export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export const idPattern=/^[a-zA-Z0-9_-]{1,100}$/;
export const iso=(value)=>typeof value==='string'&&Number.isFinite(Date.parse(value));
export function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!['localhost','127.0.0.1','[::1]'].includes(u.hostname)?u.href:null;}catch{return null;}}
function str(value,max,name,required=true){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new HttpError(400,`Invalid ${name}`);return value.trim();}
export function validateEntry(raw,projectIds){
 if(!raw||!idPattern.test(raw.id))throw new HttpError(400,'Invalid entry id');
 const types=['briefing','announcement','summary','social'];const statuses=['draft','provisional','verified','corrected','withdrawn'];
 if(!types.includes(raw.kind)||!statuses.includes(raw.status))throw new HttpError(400,'Invalid kind or status');
 const sourceUrl=safeUrl(raw.sourceUrl);if(!sourceUrl)throw new HttpError(400,'An HTTPS source is required');
 if(!iso(raw.occurredAt))throw new HttpError(400,'Invalid source time');
 if(Date.parse(raw.occurredAt)>Date.now()+300000)throw new HttpError(400,'Source time cannot be in the future');
 if(!Array.isArray(raw.projectIds)||raw.projectIds.length>10||raw.projectIds.some(x=>!projectIds.includes(x)))throw new HttpError(400,'Unknown project');
 const takeaways=raw.takeaways??[];if(!Array.isArray(takeaways)||takeaways.length>12)throw new HttpError(400,'Invalid takeaways');
 const entry={id:raw.id,kind:raw.kind,status:raw.status,title:str(raw.title,180,'title'),body:str(raw.body,10000,'body'),sourceUrl,sourceName:str(raw.sourceName,160,'source name'),occurredAt:raw.occurredAt,projectIds:[...new Set(raw.projectIds)],takeaways:takeaways.map(x=>str(x,1000,'takeaway')),tokenImpact:['direct','indirect','unclear','none'].includes(raw.tokenImpact)?raw.tokenImpact:'unclear',impactReason:str(raw.impactReason??'',1500,'impact reason',false),novelty:['new','previously-announced','unknown'].includes(raw.novelty)?raw.novelty:'unknown',excerpt:str(raw.excerpt??'',4000,'excerpt',false),stage:str(raw.stage??'',80,'stage',false),sessionId:raw.sessionId&&idPattern.test(raw.sessionId)?raw.sessionId:null,correctionNote:str(raw.correctionNote??'',1500,'correction note',false)};
 if(['announcement','summary'].includes(entry.kind)&&!entry.excerpt)throw new HttpError(400,'Announcement and summary records require a source excerpt');
 if(['corrected','withdrawn'].includes(entry.status)&&!entry.correctionNote)throw new HttpError(400,'A correction note is required');
 return entry;
}
export function validateStream(raw){
 if(!['main','royal','lparmy'].includes(raw.id))throw new HttpError(400,'Unknown stage');
 let embedUrl=null;
 if(raw.embedUrl){let u;try{u=new URL(raw.embedUrl);}catch{throw new HttpError(400,'Use a supported YouTube/Vimeo embed URL');}if(u.protocol!=='https:'||!['www.youtube-nocookie.com','www.youtube.com','player.vimeo.com'].includes(u.hostname)||!/^\/(embed\/[\w-]+|video\/\d+)$/.test(u.pathname)||u.username||u.password)throw new HttpError(400,'Use a supported YouTube/Vimeo embed URL');embedUrl=u.origin+u.pathname;}
 const sourceUrl=raw.sourceUrl?safeUrl(raw.sourceUrl):null;if(raw.sourceUrl&&!sourceUrl)throw new HttpError(400,'Invalid stream source');
 return {id:raw.id,name:str(raw.name,80,'stage name'),embedUrl,sourceUrl,sessionId:raw.sessionId&&idPattern.test(raw.sessionId)?raw.sessionId:null,enabled:raw.enabled===true};
}
export function feedVisible(entry){return ['verified','provisional','corrected','withdrawn'].includes(entry.status);}
export function sourceHealth(heartbeat,now=Date.now()){
 if(!heartbeat)return {state:'not-connected',lastSeen:null,message:'Awaiting connection'};
 const age=now-Date.parse(heartbeat.at);if(!Number.isFinite(age)||age>180000)return {...heartbeat,state:'stale',lastSeen:heartbeat.at,message:'No recent heartbeat'};
 return {...heartbeat,lastSeen:heartbeat.at};
}
export function makeCalendar(event){
 if(!iso(event.startsAt)||!iso(event.endsAt))throw new HttpError(400,'Verified date and end time required');
 const escape=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
 const stamp=s=>new Date(s).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Seb Monty//Breakpoint Guide 2026//EN','BEGIN:VEVENT',`UID:${event.id}@sebmonty.link`,`DTSTAMP:${stamp(new Date().toISOString())}`,`DTSTART:${stamp(event.startsAt)}`,`DTEND:${stamp(event.endsAt)}`,`SUMMARY:${escape(event.title)}`,`LOCATION:${escape(event.venuePublic?event.address:'Venue shared by organiser after registration')}`,`DESCRIPTION:${escape('Check the organiser for changes. '+event.sourceUrl)}`,`URL:${event.sourceUrl}`,'END:VEVENT','END:VCALENDAR'];
 return lines.map(line=>{const parts=[];let part='';for(const c of line){if(new TextEncoder().encode(part+c).length>73){parts.push(part);part=' '+c;}else part+=c;}parts.push(part);return parts.join('\r\n');}).join('\r\n')+'\r\n';
}
export async function jsonBody(request){if(Number(request.headers.get('content-length')||0)>250000)throw new HttpError(413,'Request too large');const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'JSON body required');const decoder=new TextDecoder();let bytes=0,text='';while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>250000){await reader.cancel();throw new HttpError(413,'Request too large');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();try{return JSON.parse(text);}catch{throw new HttpError(400,'Invalid JSON');}}
export async function authorized(request,expected){if(!expected)return false;const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';const a=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(supplied));const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(expected));let d=0;const x=new Uint8Array(a),y=new Uint8Array(b);for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0;}
