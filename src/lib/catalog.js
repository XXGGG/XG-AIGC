/* 目录：把数据行整理成 {id,zh,p,g,...}，并按性别、开关过滤 */
import {AGE,FACE,EYES,IRIS,BROWS,NOSE,LIPS,MAKEUP,SKIN,MARK,BODY} from "../data/person.js";
import {ETHNICITY} from "../data/ethnicity.js";
import {HAIR,HEADWEAR,NOT_HAIR} from "../data/hair.js";
import {SHOES,SOCKS} from "../data/shoes.js";
import {OUTFIT_GROUPS,PARTS,SETS} from "../data/outfits.js";
import {WEAR_DETAILS,PART_DETAILS,PLAIN_RE} from "../data/wearDetails.js";
import {VOC,HAIR_COLORS,HEADWEAR_COLORS,SHOES_COLORS,DEFTXT} from "../data/palette.js";

const N=a=>a.map(r=>({id:r[0],zh:r[1],p:r[2]||"",g:r[3]||"",back:r[4]||""}));
export const CAT={
  age:N(AGE),face:N(FACE),eyes:N(EYES),iris:N(IRIS),brows:N(BROWS),nose:N(NOSE),lips:N(LIPS),makeup:N(MAKEUP),
  skin:N(SKIN),mark:N(MARK),wd:N(WEAR_DETAILS),hair:N(HAIR),headwear:N(HEADWEAR),shoes:N(SHOES),socks:N(SOCKS).map(x=>({...x,nsfw:x.id==="fishnet"})),
  eth:ETHNICITY.map(r=>({id:r[0],zh:r[1],p:r[2],en:r[3],g:""})),
  body:BODY.map(r=>({id:r[0],zh:r[1],g:r[2],p:r[3]})),
  outer:PARTS.filter(x=>x.layer==="outer"),top:PARTS.filter(x=>x.layer==="top"),bottom:PARTS.filter(x=>x.layer==="bottom"),onepiece:PARTS.filter(x=>x.layer==="onepiece"),
  /* 套装里有泳装部件的，跟着泳装开关走 */
  set:SETS.map(x=>({...x,nsfw:[x.outer,x.top,x.bottom,x.onepiece].some(id=>id&&PARTS.find(p=>p.id===id)?.nsfw)}))
};
export {OUTFIT_GROUPS,VOC,HAIR_COLORS};
export const HC=Object.fromEntries(HAIR_COLORS.map(h=>[h.id,h]));
/* 某件衣服能加哪些细节 */
export const detailsOf=id=>[...(PART_DETAILS[id]||[]),"aged"].map(d=>CAT.wd.find(x=>x.id===d)).filter(Boolean);
export {PLAIN_RE};
export const MULTI=["makeup","mark","headwear"];
/* 饰品里只有发饰和帽子跟发型二选一，眼镜、首饰不影响发型 */
export {NOT_HAIR};
/* 外套是可选的第二层，穿在单衣或连体外面 */
/* 制服、礼服、民族服饰这类只能整套穿，不在上装/下装里单独出现（免得拼出奇怪的组合）；职业装里通用的几件可以混搭 */
const WORK_MIX=["blazer_fitted","shirt_office","slacks","slacks_belted","skirt_pencil","vest_suit"];
export const setOnly=p=>["uniform","formal","ethnic"].includes(p.group)||(p.group==="work"&&!WORK_MIX.includes(p.id));
export const LAYERS=["outer","top","bottom","onepiece"];
/* 跨性别开关只放开穿戴类 */
const CROSS=["outer","top","bottom","onepiece","set","shoes","headwear"];
export const ANCIENT_HAIR=["f_feixian","f_lingyun","f_shuangya","f_duoma","f_banji","f_xiaoyao","m_topknot","u_halfknot","m_highpony","u_loose","f_yunji","f_liangba","m_daoji"];
export const ANCIENT_HEAD=["buyao","zan","huadian","guan_f","fasuo","ribbon_f","flower","yuguan","jin","futou","mo_e"];

/* 每件东西能选哪些颜色：c 第一个是默认；d=none 表示默认不写颜色 */
const PAL={headwear:HEADWEAR_COLORS,shoes:SHOES_COLORS};
/* 常用色补齐（10-27 用户：要粉、黄、青等更多颜色）：能换色的衣服和鞋（原本有 2 个以上颜色）都给全这套；
   有图的颜色排前面，补上的颜色没有局部图，图里用默认色、提示词照写，并进「缺失项」 */
export const FULL_COLORS=["black","white","grey","beige","khaki","camel","brown","red","pink","orange","yellow","green","darkgreen","olive","cyan","lightblue","blue","navy","purple"];
const withFull=c=>c.length>=2?[...c,...FULL_COLORS.filter(x=>!c.includes(x))]:c;
/* 有局部图的颜色（左栏圆点只给这些）；补上的颜色只在细节面板里选（10-27 用户：没局部图的都放细节） */
function imgColorsOf(k,id){
  if(LAYERS.includes(k)){const p=getPart(id);return p?p.colors:[]}
  const p=(PAL[k]||{})[id];return p?p.c:[];
}
const canFull=k=>LAYERS.includes(k)||k==="shoes";
export const colorsOf=(k,id)=>canFull(k)?withFull(imgColorsOf(k,id)):imgColorsOf(k,id);
export const extraColors=(k,id)=>{const c=imgColorsOf(k,id);return canFull(k)?withFull(c).filter(x=>!c.includes(x)):[]};
export function defColor(k,id){
  if(LAYERS.includes(k)){const p=getPart(id);return p?(p.d||"none"):"none"}
  const p=(PAL[k]||{})[id];return p?p.d:"none";
}
/* 选项：默认 none 时先给「不指定」 */
export const colorOpts=(k,id)=>defColor(k,id)==="none"?["none",...imgColorsOf(k,id)]:imgColorsOf(k,id);
export const getPart=id=>PARTS.find(x=>x.id===id);
export const getSet=id=>SETS.find(x=>x.id===id);
export function deftxt(k,id){
  if(LAYERS.includes(k)){const p=getPart(id);return p&&p.deftxt||""}
  if(k==="shoes")return "";
  return DEFTXT[k+"."+id]||"";
}
/* 颜色中文：单字补「色」 */
export const cword=c=>{const w=VOC[c].zh;return w.length===1?w+"色":w};
export const ck=c=>c&&c!=="none"?c:"def";
