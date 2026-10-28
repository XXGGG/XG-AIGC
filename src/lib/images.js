/* 局部图：images.json 里登记过的才显示。文件名 <模型目录>/<f|m|u>/<分类>/<条目id>__<颜色id|def>.webp */
import IMG from "../data/images.json";
import {state,S,get,hairDirs} from "./store.js";
import {ck,defColor,getPart,getSet} from "./catalog.js";
import {currentSet} from "./store.js";
import {hairColorName,cname,nameOf} from "./names.js";
import {IMG_MODEL} from "../data/models.js";

export const BASE=import.meta.env.BASE_URL+"images/";
export const imgSrc=k=>BASE+k+".webp?v="+IMG[k].v;

/* 网站上的局部图都是 Krea 2 出的（选别的模型只换提示词）；中性条目放在 u 目录 */
export function findImg(cat,id,color,g0){
  const it=["outer","top","bottom","onepiece"].includes(cat)?getPart(id):cat==="set"?getSet(id):(cat==="sheet"||cat==="person"||cat==="scene")?null:get(cat,id);
  const g=(it&&it.g&&it.g!=="u")?it.g:(g0||state.g);
  /* 男女通用的衣服、鞋子、套装只出一张，放在 f 目录：男生找不到 m 的就用它（这些图里没有人） */
  const uni=it&&(!it.g||it.g==="u")&&["outer","top","bottom","onepiece","shoes","set"].includes(cat);
  /* 饰品、袜子只拍物品，放 u 目录，先找它 */
  const order=cat==="hair"&&it?hairDirs(it,g0||state.g):cat==="headwear"?["u",g]:cat==="socks"?[g,"u"]:uni?[g,"u","f"]:[g,"u"];
  for(const gg of order){
    const k=`${IMG_MODEL.dir}/${gg}/${cat}/${id}__${color}`;
    if(IMG[k])return {k};
  }
  return null;
}
/* 套装的小图：有外套用外套那张，连体用连体那张，否则用单衣（没有就用下装），颜色取套装里的 */
export function setImg(id){
  const st=getSet(id);if(!st)return null;
  const whole=findImg("set",id,"def");if(whole)return whole;
  const one=(L,pid,c)=>pid?findImg(L,pid,ck(c||defColor(L,pid)))||findImg(L,pid,ck(defColor(L,pid))):null;
  return (st.outer&&one("outer",st.outer,st.outer_c))||(st.onepiece?one("onepiece",st.onepiece,st.onepiece_c):null)||(one("top",st.top,st.top_c)||one("bottom",st.bottom,st.bottom_c));
}
/* 三视图：每个套装一张（东亚默认脸），默认那套另有各人种 × 年龄的；自己搭的没有三视图 */
export function sheetImg(){
  const s=S(),st=currentSet(s);if(!st)return null;
  const f=c=>findImg("sheet",st.id,c,state.g);
  return f(s.eth+"_"+s.age)||f(s.eth)||f("east_asian");
}
/* 当前选择的局部图，以及选了但图里看不到的「缺失项」 */
export function partsState(){
  const s=S(),miss=[],tiles=[];
  /* 人物：性别 × 人种 × 年龄的头像（不出三视图，长相靠这一格参考） */
  const face=findImg("person",s.eth,s.age,state.g);
  tiles.push({k:"person",row:1,img:face,val:nameOf("eth",s.eth)+" · "+nameOf("age",s.age)});
  /* 头部：发型图一直在 */
  {
    let head=findImg("hair",s.hair,s.haircolor);
    if(!head){head=findImg("hair",s.hair,"black");if(head)miss.push(["haircolor",hairColorName(s.haircolor)])}
    tiles.push({k:"head",row:1,img:head,val:nameOf("hair",s.hair)+" · "+hairColorName(s.haircolor)});
  }
  /* 第二行：选了几件饰品就出几格（10-27 用户定） */
  s.headwear.forEach(id=>{
    const want=ck(s.hwc[id]);let r=findImg("headwear",id,want);
    if(!r){r=findImg("headwear",id,ck(defColor("headwear",id)));if(r&&want!=="def")miss.push(["hwcolor",nameOf("headwear",id)+" · "+cname(s.hwc[id])])}
    tiles.push({k:"headwear",id:"hw:"+id,hw:id,row:2,img:r,all:r?[r]:[],val:nameOf("headwear",id)});
  });
  /* 服装：外套（可选）+ 单衣 + 下装，或外套（可选）+ 连体 */
  const part=(L,id,c)=>{
    let r=findImg(L,id,ck(c));
    if(!r){r=findImg(L,id,ck(defColor(L,id)));if(r&&c!=="none"&&c!==defColor(L,id))miss.push(["color",nameOf(L,id)+" · "+cname(c)])}
    return r;
  };
  /* 穿的是套装原样：整套一张图，不再拆成上下装（10-26 用户定） */
  const st=currentSet(s);
  if(st){
    const img=setImg(st.id);
    [["outer","oc","outer_c"],["top","tc","top_c"],["bottom","bc","bottom_c"],["onepiece","opc","onepiece_c"]].forEach(([L,k,sk])=>{
      const id=st[L];if(!id||(L==="onepiece")!==(s.mode==="onepiece")&&L!=="outer")return;
      const want=s[k],def=st[sk]||defColor(L,id);if(want&&want!=="none"&&want!==def)miss.push(["color",nameOf(L,id)+" · "+cname(want)]);
    });
    tiles.push({k:"set",row:3,img,val:nameOf("set",st.id)});
  }
  else if(s.outer)tiles.push({k:"outer",row:3,img:part("outer",s.outer,s.oc),val:nameOf("outer",s.outer)+" · "+cname(s.oc)});
  if(st){}
  else if(s.mode==="onepiece"){
    tiles.push({k:"onepiece",row:3,img:part("onepiece",s.onepiece,s.opc),val:nameOf("onepiece",s.onepiece)+" · "+cname(s.opc)});
  }else{
    /* 上身不穿（男生泳裤）就没有上装格子 */
    if(s.top)tiles.push({k:"top",row:3,img:part("top",s.top,s.tc),val:nameOf("top",s.top)+" · "+cname(s.tc)});
    tiles.push({k:"bottom",row:3,img:part("bottom",s.bottom,s.bc),val:nameOf("bottom",s.bottom)+" · "+cname(s.bc)});
  }
  /* 袜子：穿了就出（赤脚也一样，就是只穿袜子） */
  if(s.socks&&s.socks!=="none")tiles.push({k:"socks",row:3,img:findImg("socks",s.socks,"def"),val:nameOf("socks",s.socks)});
  /* 鞋 */
  /* 赤脚 = 不穿鞋，鞋子格子整个不出（10-27 用户定） */
  if(s.shoes!=="barefoot"){
    let shoe=findImg("shoes",s.shoes,ck(s.sc));
    if(!shoe&&s.sc!=="none"){shoe=findImg("shoes",s.shoes,"def");if(shoe)miss.push(["shoecolor",cname(s.sc)])}
    tiles.push({k:"shoes",row:3,img:shoe,val:nameOf("shoes",s.shoes)});
  }
  /* 人种：局部图都是东亚默认脸 */

  const pend=[...new Set(tiles.filter(t=>!t.img&&!t.text).map(t=>t.k))];
  return {tiles,miss,pend};
}
