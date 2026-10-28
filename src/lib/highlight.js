/* 提示词高亮：格式是固定的，左边选的词是「塞进格子里」的，按类别上色。
   人物=蓝、发型发饰=紫、服装=绿、鞋子=橙；唇妆、妆容、痣（提示词抽屉里的「细节」）和刺绣、纹身这类细节用红色标出 */
import {S,get,getPart} from "./store.js";
import {itemText,multi,wdText} from "./prompt.js";
import {PLAIN_RE} from "./catalog.js";
import {shoeText,headwearText as hwTile} from "./tilePrompt.js";
import {HC} from "./catalog.js";
import {ethText} from "../data/ethnicity.js";
import {state} from "./store.js";

const PERSON=["eth","age","face","eyes","brows","skin","body"];
const DETAIL=/刺绣|绣花|绣着|绣纹|纹身|刺青|痣|雀斑|疤|印花|涂鸦图案|水钻|镶边|织金纹样|膝襕|底襕|珠串|流苏/g;

/* 当前选择拼出来的各段文字和它们的类别 */
export function fragments(){
  const s=S(),out=[];
  const add=(t,c)=>{if(t)String(t).split(/[。；]/).map(x=>x.trim()).filter(x=>x.length>=2).forEach(x=>out.push([x,c]))};
  PERSON.forEach(k=>add(k==="eth"?ethText(s.eth,state.g):get(k,s[k])?.p,"person"));
  ["iris","nose","lips"].forEach(k=>add(get(k,s[k])?.p,"detail"));
  add(multi("makeup","zh","，"),"detail");
  add(multi("mark","zh","，"),"detail");
  {const h=get("hair",s.hair);add(h.p.split("{c}").join(HC[s.haircolor].zh),"hair");add(h.back,"hair")}
  s.headwear.forEach(id=>{add(itemText("headwear",id,s.hwc[id],"zh"),"hair");add(hwTile(id,s.hwc[id]).t,"hair")});
  const parts=(s.outer?[["outer",s.outer,s.oc]]:[]).concat(s.mode==="onepiece"?[["onepiece",s.onepiece,s.opc]]:[["top",s.top,s.tc],["bottom",s.bottom,s.bc]]);
  parts.forEach(([L,id,c])=>{if(!id||!getPart(id))return;add(itemText(L,id,c,"zh").replace(PLAIN_RE,""),"wear");add(itemText(L,id,c,"zh"),"wear");add(wdText(id),"detail");const p=getPart(id);add(p.p.split("{c}").join(""),"wear")});
  /* 人物、发型参考照里固定穿的灰蓝 T 恤，也算服装（10-27 用户：服装段要上色） */
  add("只穿一件灰蓝色纯棉细罗纹圆领短袖T恤，颜色是低饱和的中灰蓝，衣面是素净的纯色，领口贴着脖子根部","wear");
  add(itemText("shoes",s.shoes,s.sc,"zh"),"shoes");if(s.socks&&s.socks!=="none")add(get("socks",s.socks)?.p,"shoes");add(shoeText(s.shoes,s.sc).t,"shoes");
  return out.sort((a,b)=>b[0].length-a[0].length);
}

/* 把文字切成 [{t,c,x}]：先按片段标类别（长的优先），再把细节词改成红色；chg 里的片段是刚改出来的，x=true 加虚线框 */
export function segments(text,frags,chg=[]){
  const n=text.length,cat=new Array(n).fill("");
  for(const [f,c] of frags){
    let i=text.indexOf(f);
    while(i>=0){for(let j=i;j<i+f.length;j++)if(!cat[j])cat[j]=c;i=text.indexOf(f,i+f.length)}
  }
  for(const m of text.matchAll(DETAIL))for(let j=m.index;j<m.index+m[0].length;j++)if(cat[j])cat[j]="detail";
  const x=new Array(n).fill(false);
  for(const f of chg){let i=text.indexOf(f);while(i>=0){for(let j=i;j<i+f.length;j++)x[j]=true;i=text.indexOf(f,i+f.length)}}
  const out=[];
  for(let i=0;i<n;){let j=i;while(j<n&&cat[j]===cat[i]&&x[j]===x[i])j++;out.push({t:text.slice(i,j),c:cat[i],x:x[i]});i=j}
  return out;
}
