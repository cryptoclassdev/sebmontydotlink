// Builds the Breakpoint guide into ../public/breakpoint, where Next.js serves it as static files.
// Run from breakpoint/: `npm ci && npm run build`. Commit the output; Vercel does not run this step.
import {build} from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));process.chdir(root);
const BASE='/breakpoint';
const out=path.resolve(root,'../public/breakpoint');
await mkdir(out,{recursive:true});

const result=await build({entryPoints:['src/main.tsx'],bundle:true,write:false,minify:true,format:'esm',target:'es2022',define:{'process.env.NODE_ENV':'"production"','__BP_BASE__':JSON.stringify(BASE)},loader:{'.svg':'dataurl'},tsconfig:'tsconfig.json',legalComments:'none'});
const js=result.outputFiles[0].text;
const source=['src/kobra.css','src/style.css','src/seb.css'];
const css=(await postcss([tailwind({base:root})]).process((await Promise.all(source.map(f=>readFile(f,'utf8')))).join('\n'),{from:path.join(root,'src/kobra.css')})).css;
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,10);
const html=(await readFile('src/index.html','utf8')).replaceAll('__BASE__',BASE).replace('__CSS_HASH__',hash(css)).replace('__JS_HASH__',hash(js));

await writeFile(path.join(out,'app.js'),js);
await writeFile(path.join(out,'style.css'),css);
await writeFile(path.join(out,'index.html'),html);
await copyFile('src/icon.svg',path.join(out,'icon.svg'));
console.log(`Built /breakpoint: app.js ${Math.round(js.length/1024)} KB, style.css ${Math.round(css.length/1024)} KB`);
