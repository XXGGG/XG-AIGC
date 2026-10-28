/* 全局状态：左边选了什么、开关、当前模型；以及按性别和开关过滤后的列表 */
import {reactive} from "vue";
import {CAT,MULTI,LAYERS,getSet,getPart,colorsOf,defColor,ANCIENT_HAIR,ANCIENT_HEAD} from "./catalog.js";
import {ETH_LIMIT,ETH_LOOK} from "../data/ethnicity.js";
import {wearAcc} from "./acc.js";
import IMG from "../data/images.json";
import {IMG_MODEL} from "../data/models.js";
/* 发型只列有局部图的（10-28 用户：没图就去掉）。u 目录的通用发型图是女生脸，男生只认 m 目录 */
const HAIR_HAS=new Set(Object.keys(IMG).map(k=>k.split("/")).filter(a=>a[0]===IMG_MODEL.dir&&a[2]==="hair").map(a=>a[1]+"/"+a[3].split("__")[0]));
export const hairDirs=(it,g)=>it.g&&it.g!=="u"?[it.g]:g==="m"?["m"]:[g,"u"];

const clone=o=>JSON.parse(JSON.stringify(o));
/* 默认：最常见的现代装——长发（男生三七分）、素颜、白T恤、牛仔裤、低帮帆布鞋，不戴饰品（10-26 用户定） */
const DEF={
  f:{eth:"east_asian",age:"young",face:"oval",eyes:"round",iris:"dbrown",brows:"flat",nose:"fine",lips:"natural",makeup:[],skin:"fair",mark:[],body:"slim",wd:{},
     haircolor:"black",hair:"f_straight",headwear:[],hwc:{},set:"tee_jeans",shoes:"canvas_low",sc:"none",socks:"none"},
  m:{eth:"east_asian",age:"adult",face:"sharp",eyes:"narrow",iris:"black",brows:"sword",nose:"high",lips:"natural",makeup:[],skin:"warm",mark:[],body:"fit_m",wd:{},
     haircolor:"black",hair:"m_side",headwear:[],hwc:{},set:"tee_jeans",shoes:"canvas_low",sc:"none",socks:"none"}
};
export function freshSel(g){const s=clone(DEF[g]);applySet(s,s.set);return s}

export const state=reactive({
  g:"f",gmode:"female",custom:"",
  sel:{f:null,m:null},locks:{f:{},m:{}},
  cross:false,nsfw:false,showSheet:true,ask:null,
  model:"krea2",compare:false,cmp:["krea2"],zoom:null,page:"wardrobe",jump:null,
  open:{person:true},
  tab:{person:"base",hairTab:"all",top:"top",whole:"set",group:"daily"},
  /* 提示词抽屉：ptab=看哪一段（sheet=三视图，或某张局部图）；edited 按「模型|段」存改过的文字 */
  edited:{},ptab:"sheet",showDetail:false,
  /* 宽屏默认把提示词面板放在大图右边（那块原本是空的） */
  drawer:typeof window!=="undefined"&&window.innerWidth>1280
});
state.sel.f=freshSel("f");state.sel.m=freshSel("m");
export const S=()=>state.sel[state.g];

/* 套装 → 部件：一键换上整套 */
export function applySet(s,id){
  const st=getSet(id);if(!st)return;
  saveSplit(s);
  s.set=id;
  s.outer=st.outer||"";s.oc=st.outer?(st.outer_c||defColor("outer",st.outer)):"none";
  if(st.onepiece){s.mode="onepiece";s.onepiece=st.onepiece;s.opc=st.onepiece_c||defColor("onepiece",st.onepiece)}
  else{
    s.mode="split";s.bottom=st.bottom;s.bc=st.bottom_c||defColor("bottom",st.bottom);
    /* 男生泳裤这套上身不穿，top 留空 */
    if(st.top){s.top=st.top;s.tc=st.top_c||defColor("top",st.top)}else{s.top="";s.tc="none"}
  }
  /* 另一种穿法的部件也留个默认，切到上装 / 连体时不空 */
  if(s.top==null){const t=CAT.top[0];s.top=t.id;s.tc=t.d}
  if(s.bottom==null){const b=CAT.bottom[0];s.bottom=b.id;s.bc=b.d}
  if(s.onepiece==null){const o=CAT.onepiece[0];s.onepiece=o.id;s.opc=o.d}
}
/* 现在穿的是不是某个套装原样（手动换过部件就不是了） */
export function currentSet(s){
  const st=getSet(s.set);if(!st)return null;
  if(st.onepiece)return s.mode==="onepiece"&&s.onepiece===st.onepiece&&!s.outer?st:null;
  if((s.outer||"")!==(st.outer||""))return null;
  return s.mode==="split"&&s.top===(st.top||"")&&s.bottom===st.bottom?st:null;
}

export function ok(it,k){
  const s=S(),teen=s.age==="teen";
  if(it.nsfw&&(!state.nsfw||teen))return false;
  if(teen&&(it.id==="y2k"||it.id==="tee_baby"||(k==="body"&&it.id==="curvy")))return false;
  if(k==="set"&&it.bare_top&&!bareOk())return false;
  if(limited(it,k))return false;
  if(k==="hair"&&!hairDirs(it,state.g).some(d=>HAIR_HAS.has(d+"/"+it.id)))return false;
  if(!it.g||it.g==="u"||it.g===state.g)return true;
  return state.cross&&["outer","top","bottom","onepiece","set","shoes","headwear","socks"].includes(k);
}
/* 人种限制：这个人种默认不穿的服饰 / 不用的古风发型；打开「无限制穿搭」后都能选 */
export function limited(it,k){
  const lim=!state.cross&&ETH_LIMIT[S().eth];if(!lim)return false;
  if(k==="hair")return ANCIENT_HAIR.includes(it.id);
  if(k==="headwear")return ANCIENT_HEAD.includes(it.id);
  if(k==="shoes")return (lim.shoes||[]).includes(it.id);
  if(["outer","top","bottom","onepiece","set"].includes(k))return lim.groups.includes(it.group)||lim.ids.includes(it.id)||(k==="set"&&[it.outer,it.top,it.bottom,it.onepiece].some(id=>id&&lim.ids.includes(id)));
  return false;
}
/* 上身不穿只给男生（自定义性别也不给） */
export const bareOk=()=>state.g==="m"&&state.gmode!=="custom";
export const list=k=>CAT[k].filter(it=>ok(it,k));
export const get=(k,id)=>CAT[k].find(x=>x.id===id)||list(k)[0];
export const ids=k=>S()[k];

/* 开关或性别变了以后，把不再可选的东西换掉 */
export function sanitize(){
  const s=S();
  /* 穿着的套装被人种限制挡掉了，换成第一套能穿的 */
  const st=getSet(s.set);if(st&&!ok(st,"set")&&s.mode&&currentSet(s)){const x=list("set")[0];if(x)applySet(s,x.id)}
  ["eth","age","face","eyes","iris","brows","nose","lips","skin","body","hair","shoes"].forEach(k=>{const L=list(k);if(L.length&&!L.some(x=>x.id===s[k]))s[k]=(L.find(x=>x.id===DEF[state.g]?.[k])||L[0]).id});
  MULTI.forEach(k=>{s[k]=s[k].filter(id=>list(k).some(x=>x.id===id))});
  /* 外套可以不穿；穿着的外套被挡掉了就脱掉 */
  if(s.outer&&!list("outer").some(x=>x.id===s.outer)){s.outer="";s.oc="none"}
  if(s.outer&&s.oc!=="none"&&!colorsOf("outer",s.outer).includes(s.oc))s.oc=defColor("outer",s.outer);
  LAYERS.filter(L=>L!=="outer").forEach(L=>{
    const key=L,ckey=L==="top"?"tc":L==="bottom"?"bc":"opc";
    if(L==="top"&&s.top===""&&s.mode==="split"){if(bareOk())return;s.top="rashguard_top";s.tc="black"}
    if(!list(L).some(x=>x.id===s[key])){const x=list(L)[0];if(x){s[key]=x.id;s[ckey]=x.d}}
    if(s[ckey]!=="none"&&!colorsOf(L,s[key]).includes(s[ckey]))s[ckey]=defColor(L,s[key]);
  });
  if(s.sc!=="none"&&!colorsOf("shoes",s.shoes).includes(s.sc))s.sc="none";
  s.headwear.forEach(id=>{const c=s.hwc[id];if(c===undefined||(c!=="none"&&!colorsOf("headwear",id).includes(c)))s.hwc[id]=defColor("headwear",id)});
}
export function toggleMulti(k,id){
  const s=S(),i=s[k].indexOf(id);
  if(id==="none"){s[k]=[];return}
  if(i>=0)s[k].splice(i,1);else if(k==="headwear")wearAcc(s,id,defColor("headwear",id));else s[k].push(id)
}
/* 服装细节：按部件 id 记，换回这件衣服时还在 */
export function toggleWd(part,id){
  const s=S(),a=s.wd[part]||(s.wd[part]=[]),i=a.indexOf(id);
  if(i>=0)a.splice(i,1);else a.push(id);
}
/* 穿外套：古风外套配古风内搭、现代外套配现代内搭，对不上就换成这件外套的默认内搭 */
export function wearOuter(s,id){
  if(!id||id==="none"){s.outer="";s.oc="none";return}
  const o=getPart(id);s.outer=id;s.oc=defColor("outer",id);
  if(s.mode==="split"){
    const t=getPart(s.top),anc=x=>x&&x.group==="ancient";
    if(!t||anc(t)!==anc(o)){s.top=o.inner;s.tc=o.inner_c||defColor("top",o.inner)}
  }
}
/* 自己搭的分体穿法先记下来；换成套装 / 整体后，再点上装、下装里的衣服就恢复这一身（10-26 用户定） */
export function saveSplit(s){
  if(s.mode==="split"&&!currentSet(s))s.last={outer:s.outer||"",oc:s.oc||"none",top:s.top,tc:s.tc,bottom:s.bottom,bc:s.bc};
}
/* 点上装 / 下装时脱掉套装：有上次自己搭的就换回去，没有就用套装里的单衣和下装、不穿外套 */
export function leaveWhole(s){
  if(!(currentSet(s)||s.mode==="onepiece"))return;
  if(s.last)Object.assign(s,s.last);
  else{
    s.outer="";s.oc="none";
    if(!s.top){const t=CAT.top[0];s.top=t.id;s.tc=t.d}
  }
  s.mode="split";s.set="";
}
export function resetSel(){state.sel[state.g]=freshSel(state.g)}
export {getPart};
/* 窗口从宽屏缩到窄屏时，面板会盖住大图，先收起来；放宽回去再打开 */
if(typeof window!=="undefined"&&window.matchMedia){
  const mq=window.matchMedia("(min-width:1281px)");
  mq.addEventListener?.("change",e=>{state.drawer=e.matches});
}
/* 选人种：连五官、肤色、发色一起换成这个人种常见的样子（之后还能单独改） */
export function pickEth(id){
  const s=S(),look=ETH_LOOK[id]&&ETH_LOOK[id][state.g];
  s.eth=id;if(look)Object.assign(s,look);
  sanitize();
}
