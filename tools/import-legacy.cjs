// 一次性：把 v0.6 的 data.js / en.js / pal.js 转成 Vue 项目的数据模块
// 用法：node tools/import-legacy.cjs <旧文件目录>
const fs=require("fs"),path=require("path");
const SRC=process.argv[2],OUT=path.join(__dirname,"..","src","data");
const load=f=>fs.readFileSync(path.join(SRC,f),"utf8");
const names=["AGE","FACE","EYES","IRIS","BROWS","NOSE","LIPS","MAKEUP","SKIN","MARK","BODY","HAIR","HEADWEAR","OUTFIT_GROUPS","OUTFIT","SHOES"];
const ctx={};new Function("ctx",load("data.js")+";"+load("en.js")+";"+load("pal.js")+";Object.assign(ctx,{"+names.join(",")+",EN,PAL})")(ctx);
const J=v=>JSON.stringify(v,null,1).replace(/\n\s*/g,"").replace(/\],\[/g,"],\n  [");
const rows=a=>"[\n  "+a.map(r=>JSON.stringify(r)).join(",\n  ")+"\n]";
const head="/* 由 tools/import-legacy.cjs 从 v0.6 数据转来；之后直接改这里 */\n";
// 人物
let s=head+"/* 每行：[id, 名称, 提示词片段, 性别(f/m/空=通用)] */\n";
["AGE","FACE","EYES","IRIS","BROWS","NOSE","LIPS","MAKEUP","SKIN","MARK"].forEach(n=>s+=`export const ${n}=${rows(ctx[n])};\n`);
s+="/* 身材：[id, 名称, 性别, 提示词片段] */\nexport const BODY="+rows(ctx.BODY)+";\n";
fs.writeFileSync(path.join(OUT,"person.js"),s);
// 发型头饰
s=head+"/* 发型：[id, 名称, 片段（{c}=发色）, 性别 f/m/u, 背面描述] */\nexport const HAIR="+rows(ctx.HAIR)+";\n/* 头饰：[id, 名称, 片段（{c}=颜色）, 性别] */\nexport const HEADWEAR="+rows(ctx.HEADWEAR)+";\n";
fs.writeFileSync(path.join(OUT,"hair.js"),s);
// 鞋
s=head+"/* 鞋：[id, 名称, 片段（{c}=颜色）, 性别] */\nexport const SHOES="+rows(ctx.SHOES)+";\n";
fs.writeFileSync(path.join(OUT,"shoes.js"),s);
// 英文标签
s=head+"/* 动画模型（Anima）用的英文标签，{c} 换成颜色英文 */\nexport const EN="+JSON.stringify(ctx.EN,null,1)+";\n";
fs.writeFileSync(path.join(OUT,"tags.js"),s);
// 颜色
const P=ctx.PAL;
s=head+"/* 颜色词表；hair=5 个常用发色；headwear/shoes=每件能选的颜色，c 第一个是默认，d=none 表示提示词不写颜色；deftxt=不写颜色时用的句子 */\n"+
 `export const VOC=${JSON.stringify(P.voc,null,1)};\nexport const HAIR_COLORS=${JSON.stringify(P.hair,null,1)};\nexport const HEADWEAR_COLORS=${JSON.stringify(P.headwear)};\nexport const SHOES_COLORS=${JSON.stringify(P.shoes)};\nexport const DEFTXT=${JSON.stringify(P.deftxt,null,1)};\n`;
fs.writeFileSync(path.join(OUT,"palette.js"),s);
// 服装：临时按旧数据自动拆（第一行=上装，第二行=下装，只有一行=连体），等新目录出来替换
const parts=[],sets=[];
ctx.OUTFIT.forEach(r=>{
  const [grp,id,zh,p,g,nsfw]=r;const lines=p.split("\n");const pc=P.outfit[id]||{c:[],d:"none"};
  const en=(ctx.EN.outfit||{})[id]||"";
  const mk=(layer,text,suffix)=>{const has=text.includes("{c}");const pid=id+(suffix?"_"+suffix:"");
    parts.push({id:pid,zh:zh+(suffix==="top"?"·上":suffix==="bottom"?"·下":""),layer,group:grp,g:g||"",p:text,en:layer==="bottom"?"":en,colors:has?pc.c:[],d:has?pc.d:"none",deftxt:"",nsfw:!!nsfw});return pid};
  if(lines.length>1){const t=mk("top",lines[0],"top"),b=mk("bottom",lines.slice(1).join(""),"bottom");sets.push({id,zh,group:grp,g:g||"",top:t,top_c:"",bottom:b,bottom_c:"",onepiece:"",onepiece_c:""})}
  else{const o=mk("onepiece",p,"");sets.push({id,zh,group:grp,g:g||"",top:"",top_c:"",bottom:"",bottom_c:"",onepiece:o,onepiece_c:""})}
});
s=head+"/* 临时：旧套装自动拆成上装/下装/连体，新目录出来后替换 */\nexport const OUTFIT_GROUPS="+JSON.stringify(ctx.OUTFIT_GROUPS)+";\n"+
 "/* 部件：layer=top 上装 / bottom 下装 / onepiece 连体；colors 第一个是默认，d=none 不写颜色 */\nexport const PARTS="+rows(parts)+";\n/* 套装：一键搭配，对应旧版的整套服装 */\nexport const SETS="+rows(sets)+";\n";
fs.writeFileSync(path.join(OUT,"outfits.js"),s);
console.log("parts",parts.length,"sets",sets.length);
