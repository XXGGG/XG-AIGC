/* 记住上次的选择（10-27 用户定）：打开网站恢复上次的人物、穿搭、开关、提示词框展开与否；首次打开才用默认。
   只存在这台浏览器里；读写失败（无痕模式等）就当没存过 */
import {watch} from "vue";
import {state,freshSel,sanitize} from "./store.js";
const KEY="xgw.state.v1";
const KEEP=["g","gmode","custom","locks","cross","nsfw","open","tab","drawer","showDetail","page","ptab","showSheet"];
export function restore(){
  let o=null;try{o=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
  if(!o||typeof o!=="object")return;
  KEEP.forEach(k=>{if(o[k]!==undefined)state[k]=o[k]});
  if(["whitebox"].includes(state.page))state.page="wardrobe";
  ["f","m"].forEach(g=>{const v=o.sel&&o.sel[g];if(v&&typeof v==="object")state.sel[g]={...freshSel(g),...v}});
  const g0=state.g;["f","m"].forEach(g=>{state.g=g;try{sanitize()}catch(e){state.sel[g]=freshSel(g)}});state.g=g0;
}
export function autosave(){
  let t=0;
  watch(()=>[state.sel,...KEEP.map(k=>state[k])],()=>{clearTimeout(t);t=setTimeout(()=>{
    try{const o={sel:state.sel};KEEP.forEach(k=>o[k]=state[k]);localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}
  },300)},{deep:true});
}
