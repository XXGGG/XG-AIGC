/* 饰品之间互斥、饰品和发型搭不搭 */
import {ACC_SLOTS,HATS,HAT_BLOCK,ACC_NEED,HAIR_KIND,NEED_HAIR,HC_NO} from "../data/hair.js";

const SLOT={};Object.entries(ACC_SLOTS).forEach(([k,ids])=>ids.forEach(id=>SLOT[id]=k));
export const clash=(a,b)=>a!==b&&((SLOT[a]&&SLOT[a]===SLOT[b])||(HATS.includes(a)&&HAT_BLOCK.includes(b))||(HATS.includes(b)&&HAT_BLOCK.includes(a)));
export const hairOk=(id,hair)=>!ACC_NEED[id]||HAIR_KIND[ACC_NEED[id]].includes(hair);
/* 适合这件饰品的默认发型 */
export const hairFor=(id,g)=>ACC_NEED[id]?NEED_HAIR[ACC_NEED[id]][g==="m"?"m":"f"]:null;
/* 没戴的饰品为什么变暗：clash=和已戴的冲突（点了就替换掉），hair=当前发型戴不了（点了问要不要换发型） */
export function accBlock(s,id){
  if(id==="none"||s.headwear.includes(id))return "";
  if(!hairOk(id,s.hair))return "hair";
  return s.headwear.some(x=>clash(id,x))?"clash":"";
}
/* 戴上一件：冲突的先摘掉 */
export function wearAcc(s,id,defc){
  s.headwear=s.headwear.filter(x=>!clash(id,x));
  s.headwear.push(id);s.hwc[id]=defc;
}
/* 换发型或随机后：摘掉这个发型戴不了的、以及互相冲突的饰品 */
export const hcOk=(hair,hc)=>!(HC_NO[hair]||[]).includes(hc);
export function fixAcc(s){
  if(!hcOk(s.hair,s.haircolor))s.haircolor="black";
  const keep=[];
  s.headwear.forEach(id=>{if(hairOk(id,s.hair)&&!keep.some(x=>clash(id,x)))keep.push(id)});
  s.headwear=keep;
}
