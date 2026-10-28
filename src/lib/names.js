/* 界面上显示的名字：条目名、颜色名跟着界面语言走；没翻译的用中文 */
import {i18n} from "../i18n/index.js";
import {CAT,VOC,HC,LAYERS,getPart,getSet} from "./catalog.js";
import TW from "../i18n/items/zh-TW.json";
import EN from "../i18n/items/en.json";
import JA from "../i18n/items/ja.json";
import KO from "../i18n/items/ko.json";

const ITEMS={"zh-TW":TW,en:EN,ja:JA,ko:KO};
const loc=()=>i18n.global.locale.value;
const tr=key=>(ITEMS[loc()]||{})[key];
/* 上装、下装、连体的 id 不重复，翻译表里都记成 part.<id> */
export function nameOf(k,id){
  const L=LAYERS.includes(k),it=L?getPart(id):k==="set"?getSet(id):CAT[k].find(x=>x.id===id);
  return tr((L?"part.":k+".")+id)||(it?it.zh:id);
}
export const colorName=c=>c==="none"?i18n.global.t("color.none"):tr("color."+c)||(loc()==="zh-CN"?VOC[c].zh:VOC[c].en);
export const hairColorName=c=>tr("haircolor."+c)||(loc()==="zh-CN"?HC[c].label:HC[c].en);
/* 默认色：none 时显示「默认色」 */
export const cname=c=>c&&c!=="none"?colorName(c):i18n.global.t("color.def");
