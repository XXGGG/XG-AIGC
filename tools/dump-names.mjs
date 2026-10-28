/* 导出需要翻译的条目名：{ "分类.id": "中文名" }，外加每条的提示词片段做参考 */
import {CAT,VOC,HAIR_COLORS} from "../src/lib/catalog.js";
import {PARTS,SETS} from "../src/data/outfits.js";
const out={},ctx={};
for(const k of ["eth","age","face","eyes","iris","brows","nose","lips","makeup","skin","mark","body","hair","headwear","shoes"]){
  for(const it of CAT[k]){out[k+"."+it.id]=it.zh;ctx[k+"."+it.id]=(it.p||"").slice(0,90)}
}
for(const it of PARTS){out["part."+it.id]=it.zh;ctx["part."+it.id]=it.layer+": "+(it.p||"").slice(0,90)}
for(const it of SETS){out["set."+it.id]=it.zh;ctx["set."+it.id]="preset outfit: "+[it.top,it.bottom,it.onepiece].filter(Boolean).join(" + ")}
for(const [id,v] of Object.entries(VOC)){out["color."+id]=v.zh;ctx["color."+id]=v.en}
for(const h of HAIR_COLORS){out["haircolor."+h.id]=h.label;ctx["haircolor."+h.id]=h.en}
const only=process.argv[2];
console.log(JSON.stringify(only==="names"?out:{names:out,context:ctx},null,1));
