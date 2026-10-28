// 把跑图输出（xgw_batch.py run --out 的目录，或从看图页下载下来的同样结构）收进网站：
//   <from>/manifest.json + <from>/images/<key>.webp  →  public/images/<key>.webp + src/data/images.json
// 只收 Krea 2 的图（网站图只用它出）。顺便核对 manifest 里的提示词和 src/lib/tilePrompt.js 现在拼出来的是否一致，
// 不一致说明图是旧提示词出的，列出来但照样收（网站上显示的是新提示词）。
// 用法：node tools/sync-images.mjs <from目录> [--skip 不收的key文件，一行一个] [--keep]（--keep：保留 images.json 里已有、这次没出现的条目）
import fs from "fs";import path from "path";import {fileURLToPath,pathToFileURL} from "url";
const APP=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const args=process.argv.slice(2),opt=k=>{const i=args.indexOf("--"+k);return i>=0?args[i+1]:null};
const FROM=path.resolve(args[0]||".");
const {tileJobs}=await import(pathToFileURL(path.join(APP,"src/lib/tilePrompt.js")).href);
const {IMG_MODEL}=await import(pathToFileURL(path.join(APP,"src/data/models.js")).href);

const man=JSON.parse(fs.readFileSync(path.join(FROM,"manifest.json"),"utf8")).items;
const skip=new Set(opt("skip")?fs.readFileSync(opt("skip"),"utf8").split(/\r?\n/).map(s=>s.trim()).filter(Boolean):[]);
const want=new Map(tileJobs(IMG_MODEL.dir,IMG_MODEL.fmt).map(j=>[j.key,j.prompt]));
const IDX=path.join(APP,"src/data/images.json");
const idx=args.includes("--keep")?JSON.parse(fs.readFileSync(IDX,"utf8")):{};
for(const k of Object.keys(idx))if(!k.startsWith(IMG_MODEL.dir+"/"))delete idx[k];

const stale=[],missing=[],unknown=[];let n=0;
for(const [k,it] of Object.entries(man)){
  if(!k.startsWith(IMG_MODEL.dir+"/")||skip.has(k))continue;
  const src=path.join(FROM,"images",k+".webp");
  if(!fs.existsSync(src)){missing.push(k);continue}
  if(!want.has(k))unknown.push(k);
  else if(want.get(k)!==it.prompt)stale.push(k);
  const dst=path.join(APP,"public/images",k+".webp");
  fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);
  idx[k]={v:it.v||1};n++;
}
fs.writeFileSync(IDX,JSON.stringify(Object.fromEntries(Object.entries(idx).sort(([a],[b])=>a<b?-1:1))));
console.log(`收进 ${n} 张，images.json 共 ${Object.keys(idx).length} 条；跳过 ${skip.size} 条`);
if(missing.length)console.log("manifest 里有、文件没有：",missing.join(" "));
if(unknown.length)console.log("任务清单里已经没有的 key：",unknown.join(" "));
if(stale.length)console.log(`提示词和现在的不一致（旧提示词出的图）${stale.length} 张：`,stale.join(" "));
