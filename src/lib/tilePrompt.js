/* 局部图提示词：网站抽屉里显示的，和批量出图（工具包 build_jobs.mjs）用的是同一套函数，所以图和提示词一一对应。
   只依赖 data/ 里的纯数据，Node 里也能直接 import。
   取景：发型和头饰用默认脸；服装不出现人，用「隐形模特」把衣服立体撑开（外套、单衣、下装、连体各拍各的，不配别的衣服）；鞋子是一双空鞋单独摆放 */
import {TILES as T} from "../data/tiles.js";
import {HAIR,HEADWEAR,ACC_PENDING,HATS,HC_NO} from "../data/hair.js";
import {ACC_OBJ,SOCK_OBJ} from "../data/accObj.js";
import {SOCKS} from "../data/shoes.js";
import {SCENES,SCENE_WH,SCENE_VARS} from "../data/scenes.js";
import {scenePrompt} from "./scenePrompt.js";
import {sheetPrompt,beforePrompt,afterPrompt,posePrompt,dsSheet,PROMPT_IDS} from "./libPrompt.js";
import {SHEETS} from "../data/library.js";
import {SHOES} from "../data/shoes.js";
import {PARTS,SETS} from "../data/outfits.js";
import {VOC,HAIR_COLORS,HEADWEAR_COLORS,SHOES_COLORS,DEFTXT} from "../data/palette.js";

export const TILE_W=T.width,TILE_H=T.height;
const fill=(t,o)=>t.replace(/\{([A-Z_]+)\}/g,(m,k)=>o[k]!==undefined?o[k]:m);
const dot=s=>s&&!/[。！？]$/.test(s)?s+"。":s;
const cw=id=>{const w=VOC[id].zh;return w.length===1?w+"色":w};
const isF=g=>!g||g==="f"||g==="u";
const HC=Object.fromEntries(HAIR_COLORS.map(h=>[h.id,h]));
const PART=Object.fromEntries(PARTS.map(p=>[p.id,p]));
const HAIR_ROW=Object.fromEntries(HAIR.map(r=>[r[0],r])),HW_ROW=Object.fromEntries(HEADWEAR.map(r=>[r[0],r])),SHOE_ROW=Object.fromEntries(SHOES.map(r=>[r[0],r]));
/* 男生发型、饰品图：同一套模板，换成男模特 */
const M_PERSON="人物：一位二十岁出头的东亚年轻男性，长相干净自然，像日常生活中的普通年轻人；脸型轮廓清楚，下颌线条利落；眉毛是黑色的自然剑眉，中等粗细；内双眼皮，眼睛大小适中，深棕色瞳孔；鼻梁挺直，鼻头大小适中；嘴唇中等厚度，唇形清晰；肤色健康偏暖，皮肤看得见细小毛孔和自然纹理，脸上没有痣和雀斑，没有胡子。表情平静放松，嘴唇自然闭合。素颜，不化妆。耳朵和脖子上都没有首饰。";
const M_BASE={updo:"自然乌黑色的长发全部向上梳起，在头顶束成一个小发髻，鬓发收紧，露出额头和耳朵。",down:"自然乌黑色的短发，前额碎发自然垂下，两侧和后脑修得较短，露出耳朵。"};
function maleize(p){
  return p.replace(/一位女性模特/g,"一位男性模特").replace(/她/g,"他").replace(/人物：[^\n]*/,M_PERSON)
    .replace(T.base_hair_updo,M_BASE.updo).replace(T.base_hair_down,M_BASE.down);
}
const STRONG_HC=["f_lingyun","f_yunji","f_liangba"];
/* 古风头饰配盘发，其余配披发 */
const ANC=["buyao","zan","huadian","guan_f","fasuo","ribbon_f","flower","yuguan","jin","futou","mo_e"];

/* 取景变体：每条替换必须正好命中一次，免得模板改了以后悄悄失效 */
function variant(t,key){
  for(const [a,b] of (T.variants[key]||[])){
    const n=t.split(a).length-1;if(n!==1)throw new Error(`${key}: 「${a.slice(0,20)}…」出现 ${n} 次`);
    t=t.replace(a,b);
  }
  return t;
}
const person=(t,g,eth="east_asian")=>{const S=T.slots;return fill(t,{SEX:S.SEX[g],BUILD:S.BUILD[g],HAIR_TILE:S.HAIR_TILE[g],ETH:S.ETH_SKIN[eth][0],SKIN:S.ETH_SKIN[eth][1]})};
/* fmt=long（GPT-image2、即梦）保留「避免」；其余（Krea 2、Z-Image、Qwen 2.1 都是 CFG 1）换成正向的「画面要求」 */
function finish(p,kind,fmt){
  p=p.replace(/\n{3,}/g,"\n\n").trim();
  if(fmt!=="long")p=p.replace(/\n\n避免：[^\n]*$/,"\n\n"+T.require[kind]);
  if(/\{[A-Z_]+\}|undefined/.test(p))throw new Error(`${kind} 有没填的空：`+p.match(/.{0,20}(\{[A-Z_]+\}|undefined).{0,20}/)[0]);
  return p;
}

/* 戴头饰时的发型：头饰图里用的那套底发（古风头饰配盘发，其余配披发），发色跟着选的发色 */
export function baseHairFor(hwIds,hc){
  const t=hwIds.some(id=>ANC.includes(id))?T.base_hair_updo:T.base_hair_down;
  return !hc||hc===HAIR_COLORS[0].id?t:t.replace("自然乌黑色",HC[hc].zh);
}
/* 发型：hc=发色 id */
export function hairPrompt(id,hc,fmt,g="f"){
  const r=HAIR_ROW[id];if(!r||(g==="m"?r[3]==="f":!isF(r[3])))return "";
  const t=(g!=="m"&&T.items["hair/"+id])||T.hair;
  let hair=dot(r[2].split("{c}").join(r[2].includes("{c}")?HC[hc].zh:""));
  /* 非黑发容易被画回黑发，单独再强调一遍发色 */
  if(r[2].includes("{c}")&&hc!==HAIR_COLORS[0].id)hair+=`发色是染过的均匀${HC[hc].zh}，从发根到发梢整头都是${HC[hc].zh}，没有一根黑发。`;
  /* 古风大发髻浅色总被画回黑发：把发色放到最前面再强调一次 */
  if(STRONG_HC.includes(id)&&["blonde","white"].includes(hc))hair=`整头头发都是染过的${HC[hc].zh}，盘起来的发髻本身也是${HC[hc].zh}，画面里看不到任何黑色的头发。`+hair+`再次强调：发髻、鬓发和后脑的头发全部是${HC[hc].zh}。`;
  const p=fill(t,{HAIR:hair,HAIR_BACK_TILE:r[4]?"从侧后方看，"+dot(r[4]):""});
  return finish(g==="m"?maleize(p):p,"hair",fmt);
}
/* 头饰：c=颜色 id，或 def / none（不写颜色） */
export function headwearText(id,c){
  const r=HW_ROW[id],pal=HEADWEAR_COLORS[id];
  if(!c||c==="none"||c==="def")c=pal?pal.d:"none";
  if(c==="none"||!r[2].includes("{c}"))return {c:"def",t:DEFTXT["headwear."+id]||r[2].split("{c}").join("")};
  return {c,t:r[2].split("{c}").join(cw(c))};
}
export function headwearPrompt(id,c,fmt,g="f"){
  const r=HW_ROW[id];if(!r||id==="none"||(g==="m"?r[3]==="f":!isF(r[3])))return "";
  const t=(T.items["headwear/"+id])||T.headwear;
  const p=fill(t,{HEADWEAR:dot(headwearText(id,c).t),BASE_HAIR:ANC.includes(id)?T.base_hair_updo:T.base_hair_down});
  return finish(g==="m"?maleize(p):p,"headwear",fmt);
}
/* 服装部件：c=颜色 id，或 def（部件自己的默认说法） */
/* 隐形模特没有身体比着，长短容易画错：上衣写明「不是长袍」，短裤短裙写明下摆停在哪 */
const SHORT={shorts_denim:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",skirt_denim_mini:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",skirt_leather:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",skirt_pleated_mini:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",shorts_running:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",romper:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",dress_puff_mini:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",dress_tennis:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",overalls_short:"这是一条短款，长度只到大腿中部，大腿中部以下是空的背景，膝盖和小腿的位置什么都没有。",shorts_cargo:"这是一条短裤，裤脚停在膝盖上方，膝盖以下是空的背景。",shorts_bermuda:"这是一条短裤，裤脚停在膝盖上方一点，膝盖以下是空的背景。",swim_highneck:"这是一件连体泳衣，形状和体操服一样，不是连体裤：没有任何裤腿，下沿在胯部收成倒三角，腿口外面直接是空的背景。",swim_skirt:"这是一件连体泳衣，腰下只有一圈短短的小裙摆，到大腿上部为止，下面是空的背景，没有裤腿。",bikini_bottom:"这是一条很短的泳裤，只有胯部这么一小片，没有裤腿，下面是空的背景。",
  shorts_knee:"这是一条短裤，不是长裤：裤脚停在膝盖，从腰头到裤脚只有大约两个手掌长，裤脚以下是空的背景。",
  shorts_basketball:"这是一条短裤，不是长裤：裤脚停在膝盖，从腰头到裤脚只有大约两个手掌长，裤脚以下是空的背景。",
  board_shorts:"这是一条短裤，不是长裤：裤脚停在膝盖上方，从腰头到裤脚不到两个手掌长，裤脚以下是空的背景。",
  swim_knee_shorts:"这是一条短泳裤，不是长裤：裤脚停在膝盖上方，比膝盖短，从腰头到裤脚只有一个半手掌长，整条泳裤的高度和宽度差不多，裤脚以下是空的背景。",
  shorts_cycling:"这是一条短裤，不是长裤：裤脚停在大腿中部，从腰头到裤脚只有大约一个半手掌长，裤脚以下是空的背景。",
  swim_boyshorts:"这是一条很短的平角泳裤，形状像一条很短的平角短裤，不是长裤：整条只有一个手掌高，两条裤腿只有三指长，高度比宽度小得多，悬在画面中间，上下都是空的背景。",
  skirt_tennis:"这是一条短裙，不是长裙：裙摆停在大腿中部，从裙腰到裙摆只有大约一个半手掌长，裙摆以下是空的背景。",
  skirt_pencil:"这是一条及膝裙，不是长裙：裙摆停在膝盖，裙摆以下是空的背景。",
  cocktail_velvet:"这是一条短礼服裙，不是长裙：裙摆停在膝盖上方，裙摆以下是空的背景。",
  /* 10-27 23:31 用户指出画错的几件：只写它是什么样子 */
  bikini_bottom:"整条泳裤是一小片倒三角，只有一个巴掌高，高度比宽度小得多，悬在画面中间，上下都是浅灰色的空背景。",
  skirt_pleated_mini:"这是一条很短的短裙：裙摆停在大腿上部，从裙腰到裙摆只有大约一个手掌长，高度比宽度小，裙摆以下是浅灰色的空背景。",
  shorts_running:"这是一条很短的短裤：从腰头到裤脚只有大约一个手掌长，高度比宽度小，裤脚以下是浅灰色的空背景。",
  shorts_yoga:"这是一条很短的紧身短裤：从腰头到裤脚只有大约一个手掌长，高度比宽度小，裤脚以下是浅灰色的空背景。",
  swim_classic:"这是一件常见的连体泳衣，形状和体操服一样：两根细肩带，两条胳膊的位置是空的；下沿在胯部收成一个倒三角，两个腿口是弧形的，腿口下面直接就是浅灰色的空背景；整件只有从肩膀到胯部这么长。",
  swim_halter:"这是一件挂脖连体泳衣，形状和体操服一样：两根带子绕到颈后系成蝴蝶结，两条胳膊的位置是空的；下沿在胯部收成一个倒三角，两个腿口是弧形的，腿口下面直接就是浅灰色的空背景；整件只有从脖子到胯部这么长。",
  swim_onepiece:"这是一件常见的竞技款连体泳衣，形状和体操服、芭蕾练功服一样，不是连体裤也不是短裤：两根肩带，没有袖子；下沿在胯部收成一个倒三角，两个腿口从胯骨高高地斜着裁到大腿根内侧，完全没有裤腿，腿口外面直接就是空的背景；整件只有从肩膀到胯部这么长。"
};
function shapeOf(p,text){
  if(SHORT[p.id])return SHORT[p.id];
  if((p.layer==="top"||p.layer==="outer")&&p.frame!=="long"){const m=text.match(/衣长([^，；。]*)/);return `这是一件上衣，不是长袍也不是连衣裙：${m?"衣长"+m[1]:"衣长到臀部附近"}，下摆以下是空的背景。`}
  return "";
}
/* 比基尼用隐形模特拍，Krea 两次都画成长裤（10-27），改成平铺俯拍的产品照 */
/* 破洞牛仔裤隐形模特拍两次都没破洞，也改平铺（10-27） */
const FLATLAY=["bikini_bottom","bikini_top","jeans_ripped"];
function flatlay(text,k="泳装",w="一半"){
  return ["图片任务：一张方形的写实"+k+"产品照，"+k+"平铺在台面上，从正上方俯拍，清楚展示"+k+"的形状、颜色、面料和细节。","",
    "版式：1:1方形单张照片，只有一个画面。"+k+"平平地铺在画面正中，摆得整整齐齐，约占画面宽度的"+w+"，四周是浅灰色的台面。","",
    "服装："+text,"",OBJ_SHOT.bg,"",OBJ_SHOT.q,"",OBJ_SHOT.req].join("\n");
}
export function partPrompt(id,g,c,fmt){
  const p=PART[id];if(!p)return "";
  if(FLATLAY.includes(id))return id==="jeans_ripped"?flatlay(dot(p.p.split("{c}").join(cw(c||p.d)))+"两条裤腿伸直平放，膝盖上的大口子正对镜头。","牛仔裤","三分之二"):flatlay(dot(p.p.split("{c}").join(!c||c==="def"||c==="none"?"":cw(c))));
  let t=T.parts[p.layer];
  if(p.frame)t=variant(t,p.layer+":frame="+p.frame);
  if(p.pose==="turn30")t=variant(t,p.layer+":fit=tight");
  if(p.nsfw)t=variant(t,p.layer+":nsfw");
  const text=!c||c==="def"||c==="none"?dot(p.deftxt||p.p.split("{c}").join("")):dot(p.p.split("{c}").join(cw(c)));
  const full=text+shapeOf(p,text);
  return finish(person(fill(t,{OUTER:full,TOP:full,BOTTOM:full,ONEPIECE:full}),g),p.layer,fmt);
}
/* 鞋：c=颜色 id，或 def / none（鞋子默认不写颜色）；过膝靴用 shoes:thigh 的取景 */
export function shoeText(id,c){
  const r=SHOE_ROW[id];
  if(!c||c==="none"||c==="def"||!r[2].includes("{c}"))return {c:"def",t:r[2].split("{c}").join("")};
  return {c,t:r[2].split("{c}").join(cw(c))};
}
/* 鞋子单独摆放时模型爱画成短靴：低帮鞋、凉鞋、拖鞋先把形状说死，写在最前面 */
const LOW="这是一双低帮鞋，不是靴子：鞋口低于脚踝骨，整只鞋很矮，高度不到鞋长的三分之一。";
const OPEN="这是一双露趾凉鞋，不是包头鞋：鞋面只有几根细带，脚趾和脚背的位置大部分是空的，没有鞋面包住。";
const SHOE_SHAPE={
  ...Object.fromEntries(["cloth","loafer","platform","mary","heel","ballet","oxford","sneaker","canvas_low","shell_toe","kungfu","xiuhua"].map(id=>[id,LOW])),
  derby:LOW+"这是系鞋带的德比鞋，不是乐福鞋：鞋面正中有一排四到五对清楚的鞋带孔，穿着细鞋带，打成蝴蝶结；两片鞋耳缝在鞋面上方、可以微微张开。",
  canvas:"这是一双高帮帆布鞋，不是靴子：粗帆布鞋面看得见粗粗的织纹，鞋头是一块白色橡胶包头，鞋带从鞋头一直系到鞋口，鞋口刚好包到脚踝骨，白色橡胶鞋底，整只鞋的高度大约是鞋长的一半。",
  sandal:"这是一双露趾平底凉鞋，左右两只一模一样、对称摆放，两只都是凉鞋，哪一只都不是靴子或包头鞋：一块薄薄的平鞋底，鞋面只有两根宽皮带在前掌上方交叉成 X 形，后跟一根细带；鞋头完全敞开，看得见前半截鞋垫；从侧面看整只鞋只有一指高，没有鞋帮和靴筒。",heel_sandal:OPEN,
  /* 10-27 23:31 用户：木屐、人字拖、拖鞋画出了后跟。改成只写有什么（用户：不描述的就不会生成，否定说法反而招来） */
  slippers:"这是一双一字拖（家里浴室常穿的那种）：一块约一指厚的软胶鞋底，鞋底前半段上面横着一整片约四指宽的软胶鞋面，左右两边都连在鞋底的边缘上，像一座拱桥横跨整个前脚掌；鞋面下面和鞋底之间是一个宽宽的空洞，是放脚掌的地方；两只鞋一模一样；鞋底的后半段平平的，整块鞋垫露在外面。",
  flipflop:"这是一双人字拖：一块薄薄的平平的橡胶鞋底，鞋底上面只有一根Y字形的细带，细带从鞋头大脚趾和二脚趾之间的位置立起来，分成两根，斜着连到鞋底中段的左右两边；鞋底的后半段平平的，整块鞋垫露在外面。",
  geta:"这是一双中式木屐：一块平平的长方形原木板当鞋底，从头到尾一样厚；木板底下前后各一根横着的长方形木齿，一根在前脚掌下面、一根在脚跟下面，两根一样高，木齿之间是空的；木板上面前半段横着一条宽宽的深色布带，布带两端钉在木板左右两边的侧面上；木板上表面的其余部分平平的，露在外面。",
  hiking:"这是一双高帮登山靴：鞋口包住脚踝，鞋面是皮革和耐磨布拼接；鞋面正中从鞋头到鞋口一排鞋眼，上半截是金属鞋钩，一根粗粗的圆鞋带在鞋面上一路交叉系上去，在鞋口打成蝴蝶结；鞋头包着一块橡胶护头，鞋底是厚厚的深色橡胶大底，侧面看得见很深的齿状纹路。",
  oxford:LOW+"这是系鞋带的牛津皮鞋，不是乐福鞋也不是一脚蹬：鞋面正中有一排五对清楚的鞋带孔，穿着细鞋带，打成蝴蝶结，鞋带一定要画出来。",
  boat:LOW+"这是系鞋带的帆船鞋，不是乐福鞋：鞋面正中有两三对鞋带孔，一根粗皮绳穿过鞋孔，在鞋背上打成蝴蝶结，皮绳还沿着鞋口绕一圈，鞋带一定要画出来。",
  sneaker_dad:"这是一双系鞋带的厚底运动鞋，不是一脚蹬，也不是靴子：鞋口低于脚踝骨；鞋面正中有一排五到六对鞋带孔，穿着粗鞋带，打成蝴蝶结；鞋底非常厚，约四指高，侧面看得见好几层起伏的鞋底，整只鞋看起来宽大、笨重。",
  kungfu:LOW+"这是中国传统的功夫鞋，不是芭蕾鞋：黑色棉布鞋面，圆鞋头，鞋面正中有一道竖着的缝线，鞋口两侧各有一小段松紧布；鞋底是一层厚厚的白色千层布底，侧面看得见白色鞋底。整只鞋是黑色的，只有鞋底是白色。",
  mary:LOW+"这是一双玛丽珍鞋：圆头包头鞋，鞋口上方横着一根清楚的皮搭扣带，从鞋的内侧跨过鞋口到外侧，用一个小金属扣扣住；这根搭扣带一定要画出来。",
  slingback:"这是一双尖头细跟女鞋，鞋跟又细又高，约三指高，鞋底从鞋头到鞋跟明显向上抬起：前半只鞋是尖头的包头鞋面；鞋的后半段只有一根细细的皮带，绕在脚后跟的位置，带子上有一个小金属扣；鞋面和这根细带之间是一大段空当，看得见里面的鞋垫和细跟。",
  clog:"这是一双洞洞鞋（Crocs 那种橡胶凉拖鞋），不是芭蕾鞋也不是布鞋：整只鞋是一体成型的厚橡胶，鞋头又宽又圆、鼓鼓的，鞋面上有一排排圆形的大透气孔；鞋口很宽；后面有一根可以翻动的橡胶脚跟带，用两个圆钮固定在鞋两侧；鞋底很厚。",
  mule:"这是一双穆勒鞋，后跟是敞开的，像拖鞋一样：鞋面只包住前半只鞋，后半截没有任何鞋面和鞋帮，从侧面看得见露在外面的后半截鞋垫。"
};
/* 鞋子单独摆放、没有脚：去掉描述里写脚的说法 */
const NOFOOT=[[/，光脚穿着.*皮肤/,""],[/整只脚穿在鞋里，鞋面包住脚趾、脚背和脚跟，/,""],[/，把整只脚垫高/,""],[/鞋头包住脚趾和脚背/,"鞋头是包住的"],[/脚后跟整个露在鞋外/,"后跟整个敞开"],[/脚背一根搭扣/,"鞋口横着一根搭扣"],[/鞋带系到脚踝/,"鞋带系到最上面的鞋眼"]];
/* 套装整套一张：隐形模特穿着整套（外套 + 单衣 + 下装，或外套 + 整体），用整体的模板 */
const SET_ROW=Object.fromEntries(SETS.map(s=>[s.id,s]));
const SET_NOTE={
  yoga:"这是上下分开的两件：上面是一件背心，下面是一条瑜伽裤；背心的下摆和瑜伽裤的裤腰之间隔着一小段空隙，两件都要完整地出现在画面里，背心不能省略。",
  plaid_punk:"格子衬衫的两只袖子都是同样的红黑大方格，左右对称；衣身左右两片前襟也都是同样的大方格，只有里面露出的T恤是黑色纯色。"
};
export function setPrompt(id,g,fmt){
  const st=SET_ROW[id];if(!st)return "";
  if(id==="bikini"){const t=(pid,c)=>dot(PART[pid].p.split("{c}").join(cw(c)));return flatlay("上下两件平铺在一起，上衣在上、泳裤在下："+t(st.top,st.top_c)+t(st.bottom,st.bottom_c))}
  const txt=(pid,c)=>{const p=PART[pid];if(!p)return "";return dot(!c||c==="none"?(p.deftxt||p.p.split("{c}").join("")):p.p.split("{c}").join(cw(c)))};
  const parts=[];
  if(st.outer)parts.push("最外面是"+txt(st.outer,st.outer_c||PART[st.outer].d)+"外套敞开，露出里面的衣服。");
  if(st.onepiece)parts.push(txt(st.onepiece,st.onepiece_c||PART[st.onepiece].d));
  else{if(st.top)parts.push(txt(st.top,st.top_c||PART[st.top].d));if(st.bottom)parts.push("下身是"+txt(st.bottom,st.bottom_c||PART[st.bottom].d))}
  if(st.onepiece&&SHORT[st.onepiece])parts.push(SHORT[st.onepiece]);
  if(SET_NOTE[id])parts.push(SET_NOTE[id]);
  else if(!st.onepiece&&st.top&&st.bottom)parts.push("上身的衣服和下身的"+PART[st.bottom].zh+"两件都要完整地出现在画面里，一件都不能少。");
  let t=T.parts.onepiece;
  if([st.outer,st.top,st.bottom,st.onepiece].some(x=>x&&PART[x]?.nsfw))t=variant(t,"onepiece:nsfw");
  return finish(person(fill(t,{ONEPIECE:parts.join("")}),g),"onepiece",fmt);
}
/* 饰品、袜子的局部图：只拍物品，没有人（10-26 用户定） */
const OBJ_SHOT={
  q:"质量：写实的产品照，材质质感真实，看得见纹理、光泽、缝线和做工细节，对焦清晰，画面干净，噪点很少。",
  bg:"拍摄设置：浅灰色纯色棚拍背景，台面是同色的浅灰色哑光无缝背景纸，物品下方有柔和的接触阴影，柔和的正面主光，没有道具和布景。画面中没有任何文字、字母、品牌标志或水印。",
  req:"画面要求：画面里只有上面写到的物品，没有人，没有头、脸、手、脚和皮肤，也没有人头模型、假发、人台和衣架；样子和描述完全一致；画面里没有任何文字。"
};
const NONE_C={zan:"白玉",huadian:"珍珠",yuguan:"白玉"};
export function accPrompt(id,c){
  const d=ACC_OBJ[id];if(!d)return "";
  const d0=(HEADWEAR_COLORS[id]||{}).d,col=c&&c!=="def"&&c!=="none"&&VOC[c]?cw(c):(NONE_C[id]||(d0&&VOC[d0]?cw(d0):"黑色"));
  const hat=HATS.includes(id)||["guan_f","yuguan"].includes(id);
  return [
    "图片任务：一张方形的写实饰品产品照，画面里只有这件饰品本身，没有人，清楚展示它的形状、颜色、材质和大小。","",
    "版式：1:1方形单张照片，只有一个画面。饰品摆在画面正中的台面上，镜头略微俯拍，饰品约占画面宽度的一半，四周留出空白；"+(hat?"帽子自己立着，保持戴在头上时的立体形状，里面是空的。":"饰品平放，完整地出现在画面里。"),"",
    "饰品："+dot(d.split("{c}").join(col)),"",OBJ_SHOT.bg,"",OBJ_SHOT.q,"",OBJ_SHOT.req
  ].join("\n");
}
export function sockPrompt(id){
  const d=SOCK_OBJ[id];if(!d)return "";
  return [
    "图片任务：一张方形的写实袜子产品照，画面里只有这双袜子，没有人，清楚展示袜子的长短、颜色、材质和袜口的样子。","",
    "版式：1:1方形单张照片，只有一个画面。袜子左右两只并排平铺在画面正中的台面上，从袜口到袜尖完整地出现在画面里，镜头从正上方往下拍；袜子里面是空的，没有脚和腿。","",
    "袜子："+dot(d)+"左右两只的样子完全一致。","",OBJ_SHOT.bg,"",OBJ_SHOT.q,"",OBJ_SHOT.req
  ].join("\n");
}
/* 有靴筒的鞋；其余都是低帮或凉拖，提示词里不能出现「靴筒」，否则常被画成短靴（10-27） */
const BOOTS=["boot_cloth","suede","martin","riding","chelsea","block_boot","hiking","bball","cowboy","snow","thigh","chaoxue","rainboots","boot_knee_flat","ankle_heel","canvas"];
const OPEN_IDS=["sandal","heel_sandal","slippers","flipflop","geta","mule"];
const FLATS=["slippers","flipflop","geta"];
/* 男女分款：同一种鞋男款女款外形不同（10-27 用户定），写进提示词最前面 */
const SHOE_SEX={f:"这是一双成年女士穿的女款鞋，鞋型秀气纤细，尺码约 37 码。",m:"这是一双成年男士穿的男款鞋，鞋型宽大厚实、线条硬朗，尺码约 43 码，不是女款。"};
export function shoePrompt(id,g,c,fmt){
  const r=SHOE_ROW[id];if(!r||id==="barefoot")return "";
  const t=NOFOOT.reduce((s,[a,b])=>s.replace(a,b),shoeText(id,c).t);
  let tp=T.parts.shoes;if(id==="thigh")tp=variant(tp,"shoes:thigh");
  if(!BOOTS.includes(id))tp=tp.replace("有靴筒的鞋，靴筒自己立着，保持穿着时的形状。",FLATS.includes(id)?"":OPEN_IDS.includes(id)?"这双鞋是敞开的，鞋底上面只有几根带子。":"这双鞋是低帮的，鞋口低于脚踝骨，没有靴筒。");
  /* 后空鞋：45 度机位画成了玛丽珍鞋（10-28），只有正侧面画得出后空，所以这一双保留侧面 */
  if(id==="slingback")tp=tp.replace(/一双鞋并排摆在画面正中，[^。]*。/,"一双鞋朝同一个方向并排摆在画面正中，两只都是正侧面对着镜头，鞋头都朝左、鞋跟都朝右，后面那只稍微错开半只鞋；两只鞋的侧面轮廓一模一样、清清楚楚：尖尖的鞋头、包住前半段的鞋面、后半段的鞋垫、绕过后方的细带和细跟。").replace("镜头略微俯拍。","镜头和鞋差不多高。");
  /* 平底拖鞋类：和其他鞋一样斜 45 度摆（10-28 用户：正上方朝上不统一），镜头稍高一点，看清平鞋底和带子 */
  if(FLATS.includes(id))tp=tp.replace(/一双鞋并排摆在画面正中，[^。]*。/,"一双鞋并排摆在画面正中，鞋头朝向画面左前方约四十五度，靠近镜头的一只比另一只略向前半只鞋，两只鞋合起来约占画面宽度的一半；镜头从斜上方约三十度往下拍，看得见平平的鞋底上表面、上面的带子和鞋底的厚度。");
  if(FLATS.includes(id))tp=tp.replace("镜头略微俯拍。鞋子里面是空的，没有脚；","");
  let sex=SHOE_SEX[r[3]==="m"?"m":r[3]==="f"?"f":g==="m"?"m":"f"];
  /* 女款平底拖鞋会被「秀气」带出小鞋跟（10-28），换成平底的说法 */
  if(FLATS.includes(id)&&sex===SHOE_SEX.f)sex=id==="flipflop"?"这是一双成年女士穿的女款鞋，尺码约 37 码，鞋底从鞋头到鞋尾一样薄、平平地贴着地面。":"";
  /* 女款一字拖、木屐一写「女款」就被画成夹趾（10-28 三次），这两双不写男女，和男款同一写法 */
  return finish(person(fill(tp,{SHOES:sex+(SHOE_SHAPE[id]||(BOOTS.includes(id)?"":OPEN_IDS.includes(id)?OPEN:LOW))+"一双"+dot(t)}),g),"shoes",fmt);
}
/* 袜子上脚图（10-27 用户定）：只拍小腿以下穿着袜子、不穿鞋，男腿女腿分开 */
const SOCK_LEG={f:"一位成年女性的小腿和双脚，腿型纤细匀称",m:"一位成年男性的小腿和双脚，腿型结实，小腿线条硬朗，脚掌宽大"};
/* 上脚图里没有鞋，这几款要把样子说死（10-27 船袜画太高、足袋没分趾） */
const SOCK_LEG_TXT={
  ankle:"穿着一双白色隐形船袜：袜子非常浅，像一只没有鞋帮的浅口鞋垫套，只包住脚趾、脚掌和脚后跟，袜口比脚踝骨低很多，从侧面看几乎只有脚掌一圈是白色的；脚踝骨、脚踝和整段小腿都是光着的皮肤。不是短袜",
  tabi:"穿着一双白色日式分趾足袋，重点是分趾：袜子的脚尖分成两格，大脚趾单独一格，其余四根脚趾合在另一格，像只有两个指头的连指手套；大脚趾和第二根脚趾之间有一道深深的 V 形缝，脚尖正面看得清清楚楚。袜口在脚踝上方，脚后跟内侧有一排小金属搭扣。这不是普通袜子"
};
export function sockLegPrompt(id,g){
  const r=SOCKS.find(x=>x[0]===id);if(!r||id==="none")return "";
  const long=["over_knee","fishnet","tights_black"].includes(id);
  return [
    "图片任务：一张方形的写实袜子上脚照，只拍"+(long?"膝盖以下":"小腿以下")+"，清楚展示袜子穿在脚上的样子：长短、颜色、材质和袜口的位置。","",
    "版式：1:1方形单张照片，只有一个画面。"+SOCK_LEG[g]+"，并排站在画面正中，脚尖朝向镜头略偏左；画面上边缘停在"+(long?"膝盖上方一点":"膝盖下方")+"，膝盖以上不在画面里，看不到大腿、身体和脸。双脚没有穿鞋，只穿着袜子，脚底踩在地面上。","",
    "袜子："+dot(SOCK_LEG_TXT[id]||r[2])+"左右两只的样子完全一致。袜子以外露出的只有"+(long?"一点点膝盖":"小腿的皮肤")+"。","",
    "拍摄设置：浅灰色纯色棚拍背景，地面是同色的浅灰色哑光无缝背景纸，脚下有柔和的接触阴影，柔和的正面主光，没有道具和布景。画面中没有任何文字、字母、品牌标志或水印。","",
    "质量：写实的服饰产品照，针织纹理和皮肤质感真实，对焦清晰，画面干净，噪点很少。","",
    "画面要求：画面里只有"+(long?"膝盖":"小腿")+"以下的双腿和袜子，没有鞋，没有大腿、身体和脸；袜子样子和描述一致；画面里没有任何文字。"
  ].join("\n");
}

/* 批量出图的任务清单：key=<模型目录>/<f|m|u>/<分类>/<条目id>__<颜色id|def>；priority 是出图顺序 */
export function tileJobs(model,fmt="krea"){
  const jobs=[];let order=0;
  const push=(cat,g,id,color,prompt,priority)=>jobs.push({key:`${model}/${g}/${cat}/${id}__${color}`,cat,gender:g,id,color,prompt,priority,order:order++});
  const defC=p=>p.d&&p.d!=="none"?p.d:"def";
  const prOf=p=>p.nsfw?8:["daily","work","uniform","formal","sport","street"].includes(p.group)?2:5;
  const HC0=HAIR_COLORS[0].id,hairs=HAIR.filter(r=>isF(r[3]));
  /* 1 发型（第一种发色） */
  hairs.forEach(r=>push("hair",r[3]==="u"?"u":"f",r[0],HC0,hairPrompt(r[0],HC0,fmt),1));
  /* 2 现代 / 5 民族古装 / 8 泳装：女生的服装部件，颜色取部件自己的默认色 */
  const part=(p,g,c,pr)=>push(p.layer,g,p.id,c,partPrompt(p.id,g,c,fmt),pr);
  PARTS.filter(p=>p.g!=="m").forEach(p=>part(p,"f",defC(p),prOf(p)));
  /* 3 鞋 */
  SHOES.filter(r=>isF(r[3])&&r[0]!=="barefoot").forEach(r=>{const c=shoeText(r[0],"def").c;push("shoes","f",r[0],c,shoePrompt(r[0],"f",c,fmt),3)});
  /* 4 头饰（默认色） */
  /* 4 饰品：只拍物品，男女通用，放 u 目录 */
  HEADWEAR.filter(r=>r[0]!=="none").forEach(r=>{const c=headwearText(r[0],"def").c;push("headwear","u",r[0],c,accPrompt(r[0],c),4)});
  /* 4 袜子：只拍物品，放 u 目录 */
  SOCKS.filter(r=>r[0]!=="none").forEach(r=>push("socks","u",r[0],"def",sockPrompt(r[0]),4));
  /* 6 套装里用到、但不是部件默认色的颜色，补一张 */
  const seen=new Set(jobs.map(j=>j.key));
  SETS.filter(s=>s.g!=="m").forEach(s=>[["outer","outer_c"],["top","top_c"],["bottom","bottom_c"],["onepiece","onepiece_c"]].forEach(([k,ck])=>{
    const p=PART[s[k]];if(!p||!s[ck]||s[ck]===defC(p))return;
    const key=`${model}/f/${p.layer}/${p.id}__${s[ck]}`;
    if(!seen.has(key)){part(p,"f",s[ck],6);seen.add(key)}
  }));
  /* 7 其余发色 */
  HAIR_COLORS.slice(1).forEach(hc=>hairs.forEach(r=>{if(r[2].includes("{c}")&&!(HC_NO[r[0]]||[]).includes(hc.id))push("hair",r[3]==="u"?"u":"f",r[0],hc.id,hairPrompt(r[0],hc.id,fmt),7)}));
  /* 9 男款服装部件，最后跑；男女通用的只出一张（在 f 目录），男生选到时也用那张 */
  PARTS.filter(p=>p.g==="m").forEach(p=>part(p,"m",defC(p),9));
  /* 10 套装整套图（女生 / 通用放 f） */
  SETS.filter(s=>s.g!=="m").forEach(s=>push("set","f",s.id,"def",setPrompt(s.id,"f",fmt),SETS.find(x=>x.id===s.id).group==="swim"?14:10));
  /* 11 男生发型（男款和通用款，男模特） 12 男模特戴的饰品 13 男款鞋 15 男款套装整套 */
  HAIR.filter(r=>r[3]!=="f").forEach(r=>push("hair","m",r[0],HC0,hairPrompt(r[0],HC0,fmt,"m"),11));
  /* 13 男款鞋：男士专属的，加上男女通用款的男款版（10-27 起男女分款） */
  SHOES.filter(r=>r[3]!=="f"&&r[0]!=="barefoot").forEach(r=>{const c=shoeText(r[0],"def").c;push("shoes","m",r[0],c,shoePrompt(r[0],"m",c,fmt),13)});
  /* 16 袜子上脚图：男腿女腿各一张（女款只出女腿） */
  SOCKS.filter(r=>r[0]!=="none").forEach(r=>["f","m"].forEach(g=>{if(g==="m"&&r[3]==="f")return;push("socks",g,r[0],"def",sockLegPrompt(r[0],g),16)}));
  SETS.filter(s=>s.g==="m").forEach(s=>push("set","m",s.id,"def",setPrompt(s.id,"m",fmt),15));
  /* 17 场景：横屏，宽高跟着画幅走 */
  SCENES.forEach(sc=>SCENE_VARS.forEach(([v,seed])=>{push("scene","u",sc.id,v,scenePrompt(sc.id,v),17);const [w,h]=SCENE_WH[sc.ratio];Object.assign(jobs[jobs.length-1],{width:w,height:h,seed})}));
  /* 18 三视图页的角色、19 提示词页的原图和三视图（10-27 起 Krea 2 占位） */
  SHEETS.filter(c=>!c.from).forEach(c=>{push("sheet","u",c.id,"def",sheetPrompt(c.id),18);Object.assign(jobs[jobs.length-1],{width:1536,height:1024,seed:20260921})});
  PROMPT_IDS.forEach(id=>{push("prompt","u",id,"before",beforePrompt(id),19);Object.assign(jobs[jobs.length-1],{width:1024,height:1024,seed:20260921});
    push("prompt","u",id,"after",afterPrompt(id,"sheet"),19);Object.assign(jobs[jobs.length-1],{width:1536,height:1024,seed:20260921})});
  /* 10-28 起每张卡多一张「保持原姿势」；人物三视图用鲸鱼娘举例（原图是用户拿到的参考图，三视图两张先用 Krea 2 占位） */
  PROMPT_IDS.forEach(id=>{push("prompt","u",id,"pose",posePrompt(id),19);Object.assign(jobs[jobs.length-1],{width:1024,height:1024,seed:20260921})});
  PROMPT_IDS.forEach(id=>{push("prompt","u",id,"after2",afterPrompt(id,"sheet2"),19);Object.assign(jobs[jobs.length-1],{width:1536,height:1024,seed:20260921})});
  ["s1","s2"].forEach(v=>{push("prompt","u","fromchar",v,dsSheet(v),19);Object.assign(jobs[jobs.length-1],{width:1536,height:1024,seed:20260921})});
  /* 个别图挑过种子（10-27 足袋女款用 41、后空鞋用 31），重跑时保持同一张 */
  const SEED={"f/socks/tabi":20260941,"f/shoes/slingback":20260931};
  jobs.forEach(j=>{const k=j.key.split("/").slice(1,3).join("/")+"/"+j.id;if(SEED[k])j.seed=SEED[k]});
  /* 场景单张换种子（10-27 精灵森林第 1 张多出两块灰墙） */
  const SCENE_SEED={"elf_forest__def":20260924,"deepseek_q__def":20260926};
  jobs.forEach(j=>{if(j.cat==="scene"||(j.cat==="sheet"&&j.gender==="u")){const k=j.key.split("/").pop();if(SCENE_SEED[k])j.seed=SCENE_SEED[k]}});
  return jobs;
}
