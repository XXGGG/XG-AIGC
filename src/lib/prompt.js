/* 三视图提示词：long=分段完整版（GPT-image2 / 即梦），zimage=分段版但「避免」改正面写法，qwen=五段紧凑版，krea=同 zimage 的中文分段版（实测 Krea 2 吃中文比英文更听话：中栏去头、鞋子都照做），tags=Anima 英文标签。
   分段和局部图（lib/tilePrompt.js）是同一套：图片任务 / 版式 / 人物 / 头发 / 头饰 / 服装 / 拍摄设置 / 质量 / 画面要求（或避免） */
import {state,S,get,ids} from "./store.js";
import {HC,VOC,cword,deftxt,defColor,getPart,CAT,PLAIN_RE} from "./catalog.js";
import {EN} from "../data/tags.js";
import {PHOTO,ANIMA_TAGS,NEUTRAL} from "../data/style.js";
import {ethText} from "../data/ethnicity.js";

const dot=s=>s&&!/[。！？]$/.test(s)?s+"。":s;
const HC_EN={black:"black hair",brown:"brown hair",white:"silver white hair",red:"wine red hair",blonde:"blonde hair"};
const LAYER_CAT={outer:1,top:1,bottom:1,onepiece:1};

/* 衣服和鞋子只写名称、不写颜色（10-28 用户定：只给大概的词，款式和颜色留给用户自己补；局部图出图仍用 tilePrompt 的详细描述） */
const BRIEF={outer:1,top:1,bottom:1,onepiece:1,shoes:1,socks:1};
const qty=(k,zh)=>k==="shoes"||k==="socks"?"一双":k==="bottom"||/裙$/.test(zh)?"一条":"一件";
/* 条目句子：衣服鞋子见上；其余选了颜色就填进去，不写颜色时用 deftxt，没有就用默认色，再没有就去掉 {c} */
export function itemText(k,id,c,lang){
  const it=LAYER_CAT[k]?getPart(id):get(k,id);if(!it)return "";
  if(lang==="en"){
    const t=LAYER_CAT[k]?(it.en||""):((EN[k]||{})[id]||"");
    return BRIEF[k]||!(c&&c!=="none")?t.replace("{c} ","").replace("{c}",""):t.replace("{c}",VOC[c].en);
  }
  if(BRIEF[k])return id==="barefoot"?"赤脚":qty(k,it.zh)+it.zh;
  if(c&&c!=="none")return it.p.split("{c}").join(cword(c));
  const d=deftxt(k,id);if(d)return d;
  const dc=defColor(k,id);if(dc&&dc!=="none"&&it.p.includes("{c}"))return it.p.split("{c}").join(cword(dc));
  return it.p.split("{c}").join("");
}
export function multi(k,lang,sep){
  const s=S();
  return ids(k).map(id=>k==="headwear"?itemText("headwear",id,s.hwc[id],lang):(lang==="en"?((EN[k]||{})[id]||""):get(k,id).p)).filter(Boolean).join(sep);
}
function who(){if(state.gmode==="custom"&&state.custom)return state.custom+"角色";return state.g==="f"?"女子":"男子"}
function era(){
  const s=S(),p=(getPart(s.outer)||(s.mode==="onepiece"?getPart(s.onepiece):getPart(s.top)||getPart(s.bottom)))||{};
  return p.group==="ancient"?"古风":p.group==="ethnic"?"民族风":"现代";
}
export function persona(){
  const s=S(),t=k=>get(k,s[k]).p;
  const mk=multi("makeup","zh","，"),mark=multi("mark","zh","，");
  return [
    "一位"+who()+"，"+ethText(s.eth,state.g)+"，"+dot(t("age")),
    dot(t("face")),
    dot([t("eyes"),t("iris")].join("，")+"；"+t("brows")+"；"+t("nose")+"；"+t("lips")),
    dot(mk||"素颜，皮肤有真实的纹理"),
    dot(t("skin")+"，"+t("body")),
    mark?dot(mark):"",
    NEUTRAL
  ].join("");
}
/* 人物局部图：胸口以上的正面头像，看长相、年龄、人种和肤色；按 性别 × 人种 × 年龄 出图，衣服统一灰蓝T恤 */
export function portraitPrompt(){
  const g=state.g==="f"?"女性":"男性",ta=g==="女性"?"她":"他";
  return [
    `图片任务：一张方形的写实人物参考照片，画面里只有一位${g}模特，清楚展示${ta}的长相、年龄感、人种特征和肤色。`,"",
    `版式：1:1方形单张照片，只有一个画面，画面里只有${ta}一个人。胸口以上的正面近景，人物位于画面正中，头顶上方留出少量空白；身体和脸都正对镜头，目光平视镜头。`,"",
    "人物："+persona(),"",
    "头发："+hairText(false),"",
    "服装：只穿一件灰蓝色纯棉细罗纹圆领短袖T恤，颜色是低饱和的中灰蓝，衣面是素净的纯色，领口贴着脖子根部。耳朵和脖子上都没有首饰。","",
    "拍摄设置：浅灰色纯色棚拍背景，柔和的正面主光，自然阴影，没有道具和布景。画面中没有任何文字、标志或水印。","",
    "质量：电影选角用的写实定妆照，五官、皮肤纹理和年龄特征清晰真实，皮肤有真实的毛孔和纹理，对焦清晰，画面干净，噪点很少。","",
    "画面要求：皮肤保留真实纹理，五官比例自然，没有美颜磨皮；表情平静自然，嘴唇轻闭；身上没有首饰配饰；画面里没有任何文字。"
  ].join("\n");
}
/* withHw=false：头饰单独成「头饰：」一段（八段版）；紧凑版仍接在头发后面 */
export function hairText(withHw=true){
  const s=S(),it=get("hair",s.hair);
  /* 发型和头饰二选一：戴了头饰，头发就用头饰图里那套底发 */
    let h=dot(it.p.split("{c}").join(HC[s.haircolor].zh));
  if(it.back)h+="背面看得见："+dot(it.back);
  if(withHw)h+=headwearText();
  return h;
}
export const headwearText=()=>dot(multi("headwear","zh","，"));
/* 服装：上装 + 下装，或者一件连体 */
/* 当前穿的部件：[层, id, 颜色] */
export function wornParts(){
  const s=S();
  const o=s.outer?[["outer",s.outer,s.oc]]:[];
  return o.concat(s.mode==="onepiece"?[["onepiece",s.onepiece,s.opc]]:[["top",s.top,s.tc],["bottom",s.bottom,s.bc]]);
}
/* 这件衣服选了的细节句子（只有中文版写进去） */
export function wdText(id){
  const s=S();return ((s.wd||{})[id]||[]).map(d=>CAT.wd.find(x=>x.id===d)?.p).filter(Boolean).join("，");
}
/* 一件衣服的句子：加了细节就去掉「素面」说法，再把细节接在后面 */
export function partLine(L,id,c,lang){
  const base=itemText(L,id,c,lang),d=lang==="en"?"":wdText(id);
  return d?dot(base.replace(PLAIN_RE,""))+dot(d):base;
}
/* 外套写在最前面，里面穿的接着写「外套里面是…」 */
export function wearLines(lang){
  const s=S(),en=lang==="en";
  const inner=s.mode==="onepiece"?[partLine("onepiece",s.onepiece,s.opc,lang)]
    :[s.top?partLine("top",s.top,s.tc,lang):(en?"shirtless":"上身不穿衣服，露出手臂和胸膛"),partLine("bottom",s.bottom,s.bc,lang)];
  if(!s.outer)return inner;
  return [partLine("outer",s.outer,s.oc,lang),(en?"worn over ":"外套里面是")+inner[0],...inner.slice(1)];
}
/* 鞋子后面接袜子；光脚不写袜子 */
/* 赤脚又穿袜子 = 只穿袜子不穿鞋 */
const shoesText=lang=>{const s=S(),k=s.socks&&s.socks!=="none"?get("socks",s.socks):null;
  if(s.shoes==="barefoot"&&k&&k.p)return lang==="zh"?"没有穿鞋，只穿着"+itemText("socks",k.id,"",lang):"no shoes, only socks";
  const t=itemText("shoes",s.shoes,s.sc,lang);return k&&lang==="zh"&&k.p?t.replace(/[。，]*$/,"")+"，"+itemText("socks",k.id,"",lang):t};

/* 穿着里有泳装、深 V 这类开关后才有的部件 */
function wornNsfw(){
  const s=S(),ids=[s.outer,...(s.mode==="onepiece"?[s.onepiece]:[s.top,s.bottom])];
  return ids.some(id=>id&&(getPart(id)||{}).nsfw);
}
export function buildPrompt(fmt){
  const s=S(),hwNone=!s.headwear.length;
  if(fmt==="tags"){
    const e=k=>(EN[k]||{})[s[k]]||"";
    const look=[get("eth",s.eth).en,e("face"),e("eyes"),e("iris"),e("brows"),e("nose"),e("lips"),multi("makeup","en",", ")||"no makeup",e("skin"),multi("mark","en",", "),e("body"),"expressionless, neutral expression, closed mouth"].filter(Boolean).join(", ");
    const g1=state.gmode==="custom"&&state.custom?"1other, androgynous":(state.g==="f"?"1girl, solo":"1boy, solo");
    return [
      ANIMA_TAGS,
      "character sheet, reference sheet, 3 panels, close-up portrait, full body front view, back view, same character, consistent outfit, simple grey background",
      g1+", "+e("age"),look,
      HC_EN[s.haircolor]+", "+((EN.hair||{})[s.hair]||""),
      multi("headwear","en",", "),
      ...wearLines("en"),shoesText("en"),
      "modest clothing, empty hands, no weapon, no bag, no text"
    ].filter(Boolean).join(",\n");
  }
  const wear=wearLines("zh").map(dot);
  const modest=wornNsfw()?"泳衣是不透明的厚实布料。":"最里层的衣物都是不透明的布料，整套衣服合身端庄。";
  if(fmt==="long"||fmt==="zimage"||fmt==="krea"){
    const avoid=[PHOTO.av,"夸张表情","三栏之间人物或服装不一致",hwNone?"新增首饰配饰":"新增其他首饰配饰","手里拿东西（剑、包、扇子等）","低胸和暴露","画面里出现文字"].join("、");
    return [
      `图片任务：一张${PHOTO.zh}${era()}${who()}角色设定图，3:2 横版，三栏并排，同一个人，同一套衣服。`,"",
      "版式：","左栏一张大头照，从锁骨到头顶，正面，直视镜头。","中栏一张全身正面，画面从下巴开始往下，头部出画，双手自然垂在身体两侧，手里没有东西。","右栏一张全身背面，从头顶到脚，背对镜头站直。","三栏之间没有文字、标签、箭头和边框。","",
      "人物："+persona(),"",
      "头发："+hairText(false),"",
      ...(hwNone?[]:["饰品："+headwearText(),""]),
      "服装：",...wear,dot(shoesText("zh")),modest,"",
      "拍摄设置："+PHOTO.shoot,"",
      "质量："+PHOTO.q,"",
      /* Z-Image Turbo、Krea 2 都是 CFG 1，不吃反向提示词，「避免」改成正面写法 */
      fmt!=="long"?"画面要求：三栏里是同一个人、同一套衣服，细节完全一致；皮肤保留真实纹理，五官比例自然，没有美颜磨皮；"+(hwNone?"身上没有首饰配饰":"除了上面写到的饰物，身上没有别的首饰配饰")+"；双手空着；画面里没有任何文字。":"避免："+avoid+"。"
    ].join("\n");
  }
  /* qwen：紧凑五段 */
  return [
    `${PHOTO.zh}${era()}${who()}三视图角色设定图，3:2 横版，三栏并排，同一个人同一套衣服：左栏锁骨以上大头照，正面直视镜头；中栏全身正面，下巴以下，头部出画，双手自然下垂、手里没有东西；右栏全身背面站直。三栏之间没有文字、标签和边框。`,
    persona(),
    hairText(),
    wear.join("")+dot(shoesText("zh"))+modest,
    PHOTO.shoot+PHOTO.q+"画面中没有任何文字、标志或水印。"
  ].join("\n\n");
}
