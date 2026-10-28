/* 随机一套：锁住的不动；衣服鞋子用套装自带的颜色或默认色（10-28 起颜色不写进提示词、左栏也不能选） */
import {state,S,list,applySet,sanitize} from "./store.js";
import {fixAcc} from "./acc.js";
import {HAIR_COLORS,ANCIENT_HAIR,ANCIENT_HEAD,NOT_HAIR,setOnly,colorOpts,defColor,getPart} from "./catalog.js";

const pick=a=>a[Math.floor(Math.random()*a.length)];
const some=(arr,n)=>arr.slice().sort(()=>Math.random()-.5).slice(0,n);

export function randomize(){
  const s=S(),L=state.locks[state.g];
  /* 大类锁：人物、发型、饰品、服装、鞋子；瞳色、鼻子、唇妆这些细节不随机 */
  if(!L.person)["eth","age","face","eyes","brows","skin","body"].forEach(k=>{s[k]=pick(list(k)).id});
  /* 男性随机时不上口红和浓妆，手动点还是可以选 */
  if(!L.hairbox)s.haircolor=Math.random()<.6?pick(["black","brown"]):pick(HAIR_COLORS.map(h=>h.id));
  /* 服装：多数时候换一整套，偶尔同一类里混搭上下装 */
  if(!L.wear){
    const st=pick(list("set"));applySet(s,st.id);
    if(s.mode==="split"&&Math.random()<.3){
      const tops=list("top").filter(x=>x.group===st.group&&!setOnly(x)),bots=list("bottom").filter(x=>x.group===st.group&&!setOnly(x));
      if(tops.length){s.top=pick(tops).id;s.tc=defColor("top",s.top)}if(bots.length){s.bottom=pick(bots).id;s.bc=defColor("bottom",s.bottom)}
    }
    state.tab.group=st.group;
  }
  const anc=(getPart(s.mode==="onepiece"?s.onepiece:s.top)||{}).group==="ancient";
  if(!L.hairbox)s.hair=pick(list("hair").filter(h=>ANCIENT_HAIR.includes(h.id)===anc)).id;
  /* 饰品：只随机发饰和帽子，眼镜首饰不动 */
  if(!L.acc){
    s.headwear=Math.random()<.6?[]:some(list("headwear").filter(h=>h.id!=="none"&&!NOT_HAIR.includes(h.id)&&ANCIENT_HEAD.includes(h.id)===anc),1+Math.floor(Math.random()*2)).map(x=>x.id);
    s.hwc={};s.headwear.forEach(id=>s.hwc[id]=defColor("headwear",id));
  }
  /* 摘掉这个发型戴不了的、互相冲突的饰品 */
  fixAcc(s);
  if(!L.shoes){s.shoes=pick(list("shoes")).id;s.sc="none"}
  if(!anc&&!L.makeup)s.makeup=s.makeup.filter(x=>x!=="ancient");
  sanitize();
}
