// Saves the current Breakpoint community calendar as data/luma-snapshot.json.
// The live site fetches Luma itself every 10 minutes; this snapshot is only the fallback
// used when Luma is unreachable or rate-limits a fresh server. Refresh it before each deploy:
//   node scripts/snapshot-luma.mjs            (fetch from Luma)
//   node scripts/snapshot-luma.mjs items.json (build from a saved get-items response list)
import {readFile,writeFile,stat} from 'node:fs/promises';
import {fetchLumaItems,buildEvents} from '../server/luma.mjs';

const seed=JSON.parse(await readFile(new URL('../data/seed.json',import.meta.url),'utf8'));
const items=process.argv[2]?JSON.parse(await readFile(process.argv[2],'utf8')):await fetchLumaItems();
const checkedAt=process.argv[2]?(await stat(process.argv[2])).mtime.toISOString():new Date().toISOString();
const events=buildEvents(items,seed.events,checkedAt);
if(events.length<seed.events.length)throw new Error(`Only ${events.length} events; refusing to overwrite the snapshot`);
await writeFile(new URL('../data/luma-snapshot.json',import.meta.url),JSON.stringify({checkedAt,events},null,1)+'\n');
console.log(`Snapshot: ${events.length} events, ${events.filter(e=>e.venuePublic).length} with public venues`);
