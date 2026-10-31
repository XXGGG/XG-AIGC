<script setup>
import {copyText} from "../lib/copy.js";
/* 三视图、提示词、运镜、画风四页：和场景页同一个版式（10-27 用户定「完全靠右」）。
   左边筛选 + 卡片网格，点一张卡选中；右栏固定显示这张卡的提示词和复制按钮 */
import {ref,computed,watch,nextTick,onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import {state} from "../lib/store.js";
import {SHEETS,SHEET_TAGS,OWN_TAGS,FAN_TAGS,OWN_SHEETS,PROMPTS,PROMPT_MODELS} from "../data/library.js";
import {CAMERA,CAM_CATS,CAM_PARAMS,ACTOR,CAM_TONE,camSegs,KEY_TONES,LOOK_CATS} from "../data/camera.js";
import {PHOTO_STYLES,PHOTO_MODELS,PHOTO_SIZE,PHOTO_CATS,photoPrompt} from "../data/photoStyles.js";
import Icon from "./Icon.vue";
import VPlayer from "./VPlayer.vue";
import DownloadDlg from "./DownloadDlg.vue";
import IMG from "../data/images.json";
import {imgSrc} from "../lib/images.js";
import {libPrompt,sheetPrompt,VARIANTS} from "../lib/libPrompt.js";
const {t,locale}=useI18n();
const dl=ref(null),copied=ref(false);
const page=computed(()=>state.page);
const nm=o=>o[locale.value]||o["zh-CN"];
/* images.json 里登记过的图才显示 */
const pic=k=>IMG["krea2/u/"+k]?imgSrc("krea2/u/"+k):"";
/* 站长原图和运镜视频不进 images.json，直接按路径放在 public 里 */
const B=import.meta.env.BASE_URL;
const own=id=>({png:B+"sheets/"+id+".png",prev:B+"sheets/"+id+"@1200.webp"});
const cam=id=>({mp4:B+"camera/"+id+".mp4",jpg:B+"camera/"+id+".jpg"});
const actor=OWN_SHEETS.find(o=>o.id===ACTOR);

/* 三视图：标签单选筛选；站长原创和同人放一个列表，各带 own 标记 */
const TONE=Object.fromEntries(SHEET_TAGS);
const tag=ref("all");
const ALL=[...OWN_SHEETS.map(o=>({...o,own:1})),...SHEETS];
const hit=c=>tag.value==="all"||c.tags.includes(tag.value);
/* 底部 Tabs：我的（站长生成 CC0）/ 其他人的（同人二创），上面的标签跟着换 */
const who=ref("fan");
const TAGS=computed(()=>who.value==="own"?OWN_TAGS:FAN_TAGS);
const setWho=v=>{who.value=v;tag.value="all";sbig.value=false;const f=ALL.find(c=>!!c.own===(v==="own"));if(f)cur.value.sheet=f.id};
const ownList=computed(()=>who.value==="own"?ALL.filter(c=>c.own&&hit(c)):[]);
const fanList=computed(()=>who.value==="fan"?ALL.filter(c=>!c.own&&hit(c)):[]);
const sheetImg=c=>c.own?own(c.id).prev:pic("sheet/"+c.id+"__def");
/* 点三视图卡片：像场景页一样在左边看大图，左右切换只在当前筛选结果里走 */
const sbig=ref(false);
/* 提示词页一行一个 / 一行两个，默认一个，记在本机 */
const pcols=ref((()=>{try{return localStorage.getItem("xgw.promptCols")==="1"?1:2}catch{return 2}})());
const setCols=n=>{pcols.value=n;try{localStorage.setItem("xgw.promptCols",String(n))}catch{}};
const SL=computed(()=>[...ownList.value,...fanList.value]);
const sidx=computed(()=>Math.max(0,SL.value.findIndex(c=>c.id===cur.value.sheet)));
const sstep=d=>{const L=SL.value;if(L.length)cur.value.sheet=L[(sidx.value+d+L.length)%L.length].id};
const safter=computed(()=>SL.value.map((_,k)=>SL.value[(sidx.value+k)%SL.value.length]));
const openSheet=id=>{cur.value.sheet=id;sbig.value=true};

/* 每页各记一张当前选中的卡 */
const cur=ref({sheet:(ALL.find(c=>!c.own)||ALL[0]).id,prompt:PROMPTS[0].id,camera:CAMERA[0].id,filter:(CAMERA.find(c=>c.cat==="look")||CAMERA[0]).id,photo:PHOTO_STYLES[0].id});
/* 窄屏时提示词栏在列表下面，点卡片后滚过去 */
const side=ref(null);
const sel=(id,go)=>{cur.value[isPhoto.value?"photo":page.value]=id;if(go&&window.innerWidth<=900)nextTick(()=>side.value?.scrollIntoView({behavior:"smooth",block:"start"}))};
const on=id=>cur.value[isPhoto.value?"photo":page.value]===id;
const sh=computed(()=>ALL.find(c=>c.id===cur.value.sheet));
const pr=computed(()=>PROMPTS.find(p=>p.id===cur.value.prompt));
/* 画风·滤镜页和运镜页共用这套卡片和视频（10-30 用户：画风质感从运镜搬过去） */
const isCam=computed(()=>page.value==="camera"||page.value==="filter");
const ck=computed(()=>page.value==="filter"?"filter":"camera");
const cm=computed(()=>CAMERA.find(c=>c.id===cur.value[ck.value]));
/* 其他：提示词分 H3 和 SD2.0 两版，记住上次选的 */
let cv0="h3";try{cv0=localStorage.getItem("xgw.camVer")==="sd"?"sd":"h3"}catch{}
const cver=ref(cv0);
const setCver=v=>{cver.value=v;try{localStorage.setItem("xgw.camVer",v)}catch{}};
const camTxt=computed(()=>cm.value.sd&&cver.value==="sd"?cm.value.sd:cm.value.prompt);
const camPar=computed(()=>cm.value.sd&&cver.value==="sd"?cm.value.sdParams:(cm.value.params||CAM_PARAMS));
/* 运镜卡：鼠标移上去静音循环预览，移开停在开头；只有点右下角放大才在左边大屏看（10-27 用户定） */
const big=ref(false);
const hover=(e,go)=>{const v=e.currentTarget.querySelector("video");if(!v)return;if(go){v.play().catch(()=>{})}else{v.pause();v.currentTime=0}};
const openBig=id=>{cur.value[ck.value]=id;big.value=true};
watch(page,()=>{big.value=false;sbig.value=false});
/* 运镜页顶部分组筛选：只列出已经有条目的分组 */
const ccat=ref("move");
const CATS=CAM_CATS.filter(k=>k!=="look"&&CAMERA.some(c=>c.cat===k));
/* 照片画风：每张卡左 Krea2 右 GPT-image2 两张图，右栏切换看两边的提示词 */
const isPhoto=computed(()=>page.value==="photo");
/* 图片画风页（10-30 用户：导航拆成视频画风和图片画风）：底部按分类筛选，默认全部；左下切换只看一边或两边对比，默认对比 */
const pcat=ref("all");
let ps0="both";try{ps0=localStorage.getItem("xgw.phShow")||"both"}catch{}
const pshow=ref(["both","krea2","gpt"].includes(ps0)?ps0:"both");
const PSHOW=[["both",""],...PHOTO_MODELS];
/* 翻看页右上角可以收起右边提示词栏，大图更大（10-30 用户） */
let ns0=false;try{ns0=localStorage.getItem("xgw.noSide")==="1"}catch{}
const noside=ref(ns0);
const setNoside=v=>{noside.value=v;try{localStorage.setItem("xgw.noSide",v?"1":"0")}catch{}};
const setShow=v=>{pshow.value=v;if(v!=="both")pmod.value=v;try{localStorage.setItem("xgw.phShow",v)}catch{}};
const PSORT=PHOTO_CATS.flatMap(g=>PHOTO_STYLES.filter(p=>p.g===g));
const PL=computed(()=>pcat.value==="all"?PSORT:PSORT.filter(p=>p.g===pcat.value));
const SHOWN=computed(()=>pshow.value==="both"?PHOTO_MODELS:PHOTO_MODELS.filter(([m])=>m===pshow.value));
const pickCatPh=g=>{pcat.value=g;if(!PL.value.some(p=>p.id===cur.value.photo))cur.value.photo=PL.value[0].id};
const camSide=computed(()=>isCam.value&&!isPhoto.value);
const ph=computed(()=>PHOTO_STYLES.find(p=>p.id===cur.value.photo));
const phDesc=id=>PHOTO_STYLES.find(p=>p.id===id)?.desc||CAMERA.find(c=>c.id===id)?.desc;
const phName=p=>p.name?nm(p.name):t('lib.cam.'+p.id);
const pmod=ref(pshow.value==="gpt"?"gpt":"krea2");
const phTxt=computed(()=>photoPrompt(ph.value,pmod.value));
const phImg=(p,m)=>p[m==="gpt"?"gpt":"krea"]?B+"styles/"+p.id+"__"+m+".webp":"";
const pickPh=(id,m)=>{cur.value.photo=id;if(m)pmod.value=m;sel(id,1)};
/* 照片画风放大：像场景页一样左右顺着翻，两张并排（10-30 用户） */
const pidx=computed(()=>Math.max(0,PL.value.findIndex(p=>p.id===cur.value.photo)));
const pstep=d=>{const L=PL.value;cur.value.photo=L[(pidx.value+d+L.length)%L.length].id};
const pafter=computed(()=>PL.value.map((_,k)=>PL.value[(pidx.value+k)%PL.value.length]));
const openPh=id=>{cur.value.photo=id;big.value=true};
/* 视频画风页（10-30 用户）：分类和图片画风一样，底部切换，默认全部 */
const fcat=ref("all");
const LSORT=LOOK_CATS.flatMap(g=>CAMERA.filter(c=>c.cat==="look"&&c.g===g));
const FL=computed(()=>fcat.value==="all"?LSORT:LSORT.filter(c=>c.g===fcat.value));
const pickCatF=g=>{fcat.value=g;if(!FL.value.some(c=>c.id===cur.value.filter))cur.value.filter=FL.value[0].id};
/* 右栏标出只有图片版或只有视频版的画风，方便判断能不能拿图当图生视频的首帧（10-30 用户） */
const LOOKPH=new Set(CAMERA.filter(c=>c.cat==="look").map(c=>c.ph||c.id));
const onlyTag=computed(()=>isPhoto.value?(LOOKPH.has(ph.value.id)?"":"onlyPhoto"):page.value==="filter"&&!PHOTO_STYLES.some(p=>p.id===(cm.value.ph||cm.value.id))?"onlyVideo":"");
const camList=computed(()=>page.value==="filter"?FL.value:CAMERA.filter(c=>c.cat===ccat.value));
/* 视频画风也像图片画风一样（10-30 用户）：每张卡左 H3 右 SD2.0 两个视频，可切对比 / 只看一边，放大后左右顺着翻。
   视频 public/camera/<id>__h3|sd.mp4 + .jpg，h3v:1 / sdv:1 才显示 */
const isLook=computed(()=>page.value==="filter");
const VMODELS=[["h3","MiniMax H3"],["sd","SD2.0"]];
let vs0="both";try{vs0=localStorage.getItem("xgw.vShow")||"both"}catch{}
const vshow=ref(["both","h3","sd"].includes(vs0)?vs0:"both");
const VSHOW=[["both",""],...VMODELS];
const VSHOWN=computed(()=>vshow.value==="both"?VMODELS:VMODELS.filter(([m])=>m===vshow.value));
const setVshow=v=>{vshow.value=v;if(v!=="both")setCver(v);try{localStorage.setItem("xgw.vShow",v)}catch{}};
const lvid=(c,m)=>c[m+"v"]?{mp4:B+"camera/"+c.id+"__"+m+".mp4",jpg:B+"camera/"+c.id+"__"+m+".jpg"}:null;
const lthumb=c=>{for(const [m] of VSHOWN.value){const v=lvid(c,m);if(v)return v.jpg}return ""};
const pickLook=(id,m)=>{cur.value.filter=id;if(m)setCver(m);sel(id,1)};
const fidx=computed(()=>Math.max(0,FL.value.findIndex(c=>c.id===cur.value.filter)));
const fstep=d=>{const L=FL.value;cur.value.filter=L[(fidx.value+d+L.length)%L.length].id};
const fafter=computed(()=>FL.value.map((_,k)=>FL.value[(fidx.value+k)%FL.value.length]));
const pickCat=k=>{ccat.value=k;const f=CAMERA.find(c=>c.cat===k);if(f)cur.value.camera=f.id};
const CT=CAM_TONE;
/* 大屏里左右切换（只在已有视频的运镜之间），下面一排从当前这条往后排 */
const VIDS=computed(()=>page.value==="filter"?FL.value.filter(c=>c.video):CAMERA.filter(c=>c.video&&c.cat!=="look"));
const vidx=computed(()=>Math.max(0,VIDS.value.findIndex(c=>c.id===cur.value[ck.value])));
const step=d=>{const V=VIDS.value;cur.value[ck.value]=V[(vidx.value+d+V.length)%V.length].id};
const after=computed(()=>VIDS.value.map((_,k)=>VIDS.value[(vidx.value+k)%VIDS.value.length]));
const onKey=e=>{if(sbig.value&&page.value==="sheet"&&!/INPUT|TEXTAREA/.test(e.target.tagName)&&!state.zoom){if(e.key==="ArrowRight")sstep(1);else if(e.key==="ArrowLeft")sstep(-1);else if(e.key==="Escape")sbig.value=false;return}
  if(!big.value||!(isCam.value||isPhoto.value)||state.zoom||/INPUT|TEXTAREA/.test(e.target.tagName))return;const S=isPhoto.value?pstep:isLook.value?fstep:step;if(e.key==="ArrowRight")S(1);else if(e.key==="ArrowLeft")S(-1);else if(e.key==="Escape"&&!document.fullscreenElement)big.value=false};
/* 先于 App 的 Esc 处理跑，放大层开着时只关放大层 */
window.addEventListener("keydown",onKey,true);onBeforeUnmount(()=>window.removeEventListener("keydown",onKey,true));
/* 手机没有悬停：滚到屏幕里的运镜卡自动静音播放，滚出去就停 */
let io=null;
const grid=ref(null);
watch([grid,page,big],()=>{io?.disconnect();io=null;if(!grid.value||typeof IntersectionObserver==="undefined"||!matchMedia("(hover: none)").matches)return;
  io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting)v.play().catch(()=>{});else v.pause()}),{threshold:.6});
  grid.value.querySelectorAll("video").forEach(v=>io.observe(v))},{flush:"post"});
onBeforeUnmount(()=>io?.disconnect());
const pm=ref({});
const pick=id=>pm.value[id]||PROMPT_MODELS[0];
/* 提示词卡：每张两种做法（转换类：保持原姿势 / 做成三视图；人物三视图：1 / 2），卡里一张原图 + 两张结果 */
const pv=ref({});
const vpick=id=>pv.value[id]||VARIANTS(id)[0];
/* 替换衣服在原图后面多一张「参考图」（要换上的衣服） */
/* 动漫 2D 化和替换衣服的示例是 2:3 竖版单人图（10-28） */
const TALL=new Set(["anime2d","outfit"]);
const figs=id=>{const r=TALL.has(id)?"r23":"r11";return [["before",r],...(id==="outfit"?[["ref",r]]:[]),...VARIANTS(id).map(v=>[v==="sheet"?"after":v==="sheet2"?"after2":v==="sheet3"?"after3":v,v==="pose"?r:"r32",v])]};
/* 用别人立绘举例的卡：署名 + 原帖（10-28 用户定按 CC BY-NC-SA 4.0 标） */
const SRC=[["dsHome","https://space.bilibili.com/4456176"],["dsSrc","https://www.bilibili.com/opus/1233069202138464289"]];
const CREDIT={fromchar:SRC,model3d:SRC,chibi:SRC,real:SRC,ds:SRC,zzp:SRC,
  hp:[["dsSrc","https://x.com/redteneri/status/2102398387194626330"]],
  gu:[["dsSrc","https://search.bilibili.com/all?keyword=%E6%B2%A1%E4%BB%80%E4%B9%88%EF%BC%8C%E5%8F%AA%E6%98%AF%E6%83%B3%E8%AE%A9%E4%BD%A0%E7%9F%A5%E9%81%93%E8%BF%99%E5%8F%AA%E4%BC%81%E9%B9%85%E7%9A%84%E5%87%BA%E5%A4%84"]]};
const CCL="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans";
/* 提示词页每一行一种颜色框（10-28 用户定） */
const PTONE=["person","hair","wear","shoes","detail","look"];
const pickV=(id,v)=>{if(v)pv.value[id]=v;sel(id,1)};

/* 右栏：标题和要复制的整段文字 */
const title=computed(()=>page.value==="sheet"?nm(sh.value.name):page.value==="prompt"?t('lib.p.'+pr.value.id):t('lib.cam.'+cm.value.id));
const text=computed(()=>isPhoto.value?phTxt.value:page.value==="sheet"?(sh.value.own?sh.value.prompt:sh.value.from?libPrompt(...sh.value.from,"gpt"):sh.value.prompt||sheetPrompt(sh.value.id)):page.value==="prompt"?libPrompt(pr.value.id,vpick(pr.value.id),pick(pr.value.id)):camTxt.value);
const copy=()=>{copyText(text.value).then(ok=>{if(!ok)return;copied.value=true;setTimeout(()=>copied.value=false,1400)})};

/* 放大原图；从运镜页点开的会多一个「查看原处」，跳到三视图页并选中那张 */
const zoomOwn=(o,go)=>{state.zoom={title:nm(o.name),srcs:[own(o.id).png],sheet:true,note:t('lib.ownZoom'),go:go?{page:"sheet",id:o.id}:null}};
const zoomFan=c=>{const s=pic("sheet/"+c.id+"__def");if(s)state.zoom={title:nm(c.name),srcs:[s],sheet:true}};
const zoomSheet=c=>c.own?zoomOwn(c):zoomFan(c);
const flash=ref("");
watch(()=>[state.page,state.jump],()=>{const id=state.jump;if(!id||state.page!=="sheet")return;who.value=ALL.find(c=>c.id===id&&c.own)?"own":"fan";tag.value="all";state.jump=null;sbig.value=false;cur.value.sheet=id;
  nextTick(()=>{const el=document.getElementById("card-"+id);if(!el)return;el.scrollIntoView({behavior:"smooth",block:"center"});flash.value=id;setTimeout(()=>{flash.value=""},1600)})},{immediate:true});
</script>
<template>
  <main :class="['scenes',{noside:(isPhoto||isLook)&&big&&noside}]" :aria-label="t('nav.'+page)">
    <section :class="['slist',{withtabs:page==='sheet'||page==='prompt'||page==='photo'||page==='filter',viewing:((isCam||isPhoto)&&big)||(page==='sheet'&&sbig)}]">

      <div v-if="page==='sheet'&&sbig" class="sview shview">
        <div class="svhead"><button class="pill" @click="sbig=false">← {{t('lib.sheetBack')}}</button><b>{{nm(sh.name)}}</b><span class="stg"><i v-for="g in sh.tags" :key="g" :class="'chip tone-'+TONE[g]">{{t('lib.tag.'+g)}}</i></span><em class="cnt">{{sidx+1}} / {{SL.length}}</em><a v-if="sh.own" class="pill dlbtn" :href="own(sh.id).png" :download="sh.id+'.png'">{{t('lib.dlPng')}}</a></div>
        <div class="slot big"><button v-if="sheetImg(sh)" class="zimg" :aria-label="t('stage.zoom',{x:nm(sh.name)})" @click="zoomSheet(sh)"><img :src="sheetImg(sh)" :alt="nm(sh.name)" decoding="async"></button><Icon v-else n="sheet" :size="30"/>
          <button class="snav l" :aria-label="t('scene.prev')" @click="sstep(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="sstep(1)">›</button>
          <em class="bdg">{{t('part.ai')}}</em></div>
        <div class="shstrip"><button v-for="c in safter" :key="c.id" class="slot r32" :aria-selected="c.id===sh.id" :aria-label="nm(c.name)" @click="cur.sheet=c.id"><img v-if="sheetImg(c)" :src="sheetImg(c)" alt="" loading="lazy" decoding="async"><Icon v-else n="sheet" :size="18"/></button></div>
      </div>
      <template v-else-if="page==='sheet'">
        <div class="sfilter">
          <div class="stags" role="group" :aria-label="t('lib.tagsL')">
            <button class="cap" :aria-pressed="tag==='all'" @click="tag='all'">{{t('scene.all')}}</button>
            <button v-for="g in TAGS" :key="g" :class="'cap tone-'+TONE[g]" :aria-pressed="tag===g" @click="tag=g">{{t('lib.tag.'+g)}}</button>
          </div>
        </div>
        <template v-for="[h,L] in [['ownH',ownList],['fanH',fanList]]" :key="h">
          <template v-if="L.length">
            <h3 class="lsech">{{t('lib.'+h)}}</h3>
            <aside v-if="h==='fanH'" class="warn" role="note"><h3>{{t('lib.warnH')}}</h3><p>{{t('lib.warn')}}</p></aside>
            <div class="sgrid">
              <button v-for="c in L" :key="c.id" :id="'card-'+c.id" :class="['scard','nohl',{flash:flash===c.id}]" :aria-pressed="on(c.id)" @click="openSheet(c.id)">
                <div class="slot r32"><img v-if="sheetImg(c)" :src="sheetImg(c)" :alt="nm(c.name)" loading="lazy" decoding="async"><Icon v-else n="sheet" :size="22"/><em v-if="sheetImg(c)" class="bdg">{{t('part.ai')}}</em></div>
                <b>{{nm(c.name)}}</b>
                <span class="stg"><i v-for="g in c.tags" :key="g" :class="'chip tone-'+TONE[g]">{{t('lib.tag.'+g)}}</i></span>
              </button>
            </div>
          </template>
        </template>
        <div class="sidetabs" role="tablist" :aria-label="t('lib.sideL')">
          <button v-for="v in ['fan','own']" :key="v" role="tab" :aria-selected="who===v" @click="setWho(v)">{{t('lib.side.'+v)}}</button>
        </div>
      </template>

      <template v-else-if="page==='prompt'">
      <div :class="['sgrid','wide','ptri',{two:pcols===2}]">
        <div v-for="(p,i) in PROMPTS" :key="p.id" :class="['scard','nohl','prow','tone-'+PTONE[i%PTONE.length]]" role="button" tabindex="0" :aria-pressed="on(p.id)" @click="pickV(p.id)" @keydown.enter="pickV(p.id)">
          <h3 class="prow-h">{{t('lib.p.'+p.id)}}</h3>
          <p v-if="p.id==='mimic'||p.id==='vformat'" class="pdesc">{{t('lib.'+p.id+'Desc')}}</p>
          <div v-else :class="['pair','tri',p.id==='fromchar'?'three32':p.id==='outfit'?'quad4':'quad',{tall:TALL.has(p.id)}]">
            <figure v-for="[k,r,v] in figs(p.id)" :key="k" :class="{von:v&&on(p.id)&&vpick(p.id)===v}" @click.stop="pickV(p.id,v)"><div :class="'slot '+r"><img v-if="pic('prompt/'+p.id+'__'+k)" :src="pic('prompt/'+p.id+'__'+k)" alt="" loading="lazy"><Icon v-else :n="r==='r32'?'sheet':'scene'" :size="22"/></div><figcaption>{{v?t('lib.pv.'+v):k==='ref'?t('lib.refImg'):t('lib.before')}}</figcaption></figure>
          </div>
        </div>
      </div>
      <div class="sidetabs left" role="tablist" :aria-label="t('lib.colsL')">
        <button v-for="n in [1,2]" :key="n" class="colbtn" role="tab" :aria-selected="pcols===n" :aria-label="t('lib.cols'+n)" :title="t('lib.cols'+n)" @click="setCols(n)"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect v-if="n===1" x="2.5" y="3.5" width="13" height="11" rx="2"/><template v-else><rect x="1.8" y="3.5" width="6.2" height="11" rx="1.6"/><rect x="10" y="3.5" width="6.2" height="11" rx="1.6"/></template></svg></button>
      </div>
      </template>

      <div v-else-if="page==='camera'&&!big" class="sfilter">
        <div class="stags" role="group" :aria-label="t('lib.tagsL')">
          <button v-for="k in CATS" :key="k" :class="'cap tone-'+CT[k]" :aria-pressed="ccat===k" @click="pickCat(k)">{{t('lib.camCat.'+k)}}</button>
        </div>
      </div>
      <div v-if="isPhoto&&!big" :class="['sgrid','wide','phgrid',{one:pshow!=='both'}]">
        <div v-for="p in PL" :key="p.id" class="scard nohl" role="button" tabindex="0" :aria-pressed="on(p.id)" @click="pickPh(p.id)" @keydown.enter="pickPh(p.id)" @dblclick="openPh(p.id)">
          <div class="pair even">
            <figure v-for="[m,lab] in SHOWN" :key="m" :class="{von:on(p.id)&&pmod===m}" @click.stop="pickPh(p.id,m)">
              <div class="slot r32"><img v-if="phImg(p,m)" :src="phImg(p,m)" :alt="phName(p)+' · '+lab" loading="lazy" decoding="async"><span v-else class="campend"><Icon n="filter" :size="22"/>{{t('lib.imgPending')}}</span></div>
              <figcaption>{{lab}}</figcaption>
            </figure>
          </div>
          <div class="scfoot"><span class="scsel"><b>{{phName(p)}}</b><span class="camsub">{{nm(phDesc(p.id))}}</span></span><button class="cbig" :aria-label="t('lib.camBig')" :title="t('lib.camBig')" @click.stop="openPh(p.id)"><Icon n="expand" :size="16"/></button></div>
        </div>
      </div>
      <div v-if="isLook&&!big" ref="grid" :class="['sgrid','wide','phgrid',{one:vshow!=='both'}]">
        <div v-for="c in FL" :key="c.id" class="scard nohl" role="button" tabindex="0" :aria-pressed="on(c.id)" @click="pickLook(c.id)" @keydown.enter="pickLook(c.id)" @dblclick="cur.filter=c.id;big=true">
          <div class="pair even">
            <figure v-for="[m,lab] in VSHOWN" :key="m" :class="{von:on(c.id)&&cver===m}" @click.stop="pickLook(c.id,m)" @mouseenter="hover($event,1)" @mouseleave="hover($event,0)">
              <div class="slot r169"><video v-if="lvid(c,m)" :src="lvid(c,m).mp4" :poster="lvid(c,m).jpg" muted loop playsinline preload="none" disablepictureinpicture></video><span v-else class="campend"><Icon n="camera" :size="22"/>{{t('lib.camPending')}}</span></div>
              <figcaption>{{lab}}</figcaption>
            </figure>
          </div>
          <div class="scfoot"><span class="scsel"><b>{{t('lib.cam.'+c.id)}}</b><span class="camsub">{{nm(c.desc)}}</span></span><button class="cbig" :aria-label="t('lib.camBig')" :title="t('lib.camBig')" @click.stop="cur.filter=c.id;big=true"><Icon n="expand" :size="16"/></button></div>
        </div>
      </div>
      <div v-if="isLook&&big" class="sview phview">
        <div class="svhead"><button class="pill" @click="big=false">← {{t('nav.filter')}}</button><b>{{t('lib.cam.'+cm.id)}}</b><span class="camsub">{{nm(cm.desc)}}</span><em class="cnt">{{fidx+1}} / {{FL.length}}</em>
          <span class="phctl"><span class="tabs big" role="tablist" :aria-label="t('lib.phShowL')"><button v-for="[v,lab] in VSHOW" :key="v" class="tab" role="tab" :aria-selected="vshow===v" @click="setVshow(v)">{{lab||t('lib.compare')}}</button></span>
          <button class="pill sidebtn" :aria-pressed="noside" :aria-label="t(noside?'lib.sideShow':'lib.sideHide')" :title="t(noside?'lib.sideShow':'lib.sideHide')" @click="setNoside(!noside)"><Icon n="sidebar" :size="16"/></button></span></div>
        <div class="slot big"><div :class="['phpair','vid',{one:vshow!=='both'}]">
            <figure v-for="[m,lab] in VSHOWN" :key="cm.id+m" :class="{von:cver===m}" @click="setCver(m)"><div class="zimg"><VPlayer v-if="lvid(cm,m)" :src="lvid(cm,m).mp4" :poster="lvid(cm,m).jpg" quiet/><span v-else class="campend"><Icon n="camera" :size="22"/>{{t('lib.camPending')}}</span></div><figcaption>{{lab}}</figcaption></figure>
          </div>
          <button class="snav l" :aria-label="t('scene.prev')" @click="fstep(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="fstep(1)">›</button></div>
        <div class="sstrip camstrip">
          <button v-for="c in fafter" :key="c.id" class="cstrip" :aria-selected="c.id===cm.id" @click="cur.filter=c.id">
            <span class="slot"><img v-if="lthumb(c)" :src="lthumb(c)" alt="" loading="lazy" decoding="async"><Icon v-else n="camera" :size="18"/></span>
            <span class="sgl">{{t('lib.cam.'+c.id)}}</span>
          </button>
        </div>
      </div>
      <div v-if="isCam&&!big&&!isPhoto&&!isLook" ref="grid" class="sgrid wide">
        <article v-for="c in camList" :key="c.id" class="scard" :class="{on:on(c.id)}" @click="sel(c.id)" @dblclick="c.video&&openBig(c.id)" @mouseenter="hover($event,1)" @mouseleave="hover($event,0)">
          <div :class="'slot '+(c.ratio||'r169')"><video v-if="c.video" :src="cam(c.id).mp4" :poster="cam(c.id).jpg" muted loop playsinline preload="none" disablepictureinpicture></video><span v-else class="campend"><Icon n="camera" :size="22"/>{{t('lib.camPending')}}</span></div>
          <div class="scfoot">
            <button class="scsel" :aria-pressed="on(c.id)" @click.stop="sel(c.id,1)"><b>{{t('lib.cam.'+c.id)}}</b><span class="camsub">{{nm(c.desc)}}</span></button>
            <button v-if="c.video" class="cbig" :aria-label="t('lib.camBig')" :title="t('lib.camBig')" @click.stop="openBig(c.id)"><Icon n="expand" :size="16"/></button>
          </div>
        </article>
      </div>
      <div v-if="isPhoto&&big" class="sview phview">
        <div class="svhead"><button class="pill" @click="big=false">← {{t('nav.photo')}}</button><b>{{phName(ph)}}</b><span class="camsub">{{nm(phDesc(ph.id))}}</span><em class="cnt">{{pidx+1}} / {{PL.length}}</em>
          <span class="phctl"><span class="tabs big" role="tablist" :aria-label="t('lib.phShowL')"><button v-for="[v,lab] in PSHOW" :key="v" class="tab" role="tab" :aria-selected="pshow===v" @click="setShow(v)">{{lab||t('lib.compare')}}</button></span>
          <button class="pill sidebtn" :aria-pressed="noside" :aria-label="t(noside?'lib.sideShow':'lib.sideHide')" :title="t(noside?'lib.sideShow':'lib.sideHide')" @click="setNoside(!noside)"><Icon n="sidebar" :size="16"/></button></span></div>
        <div class="slot big"><div :class="['phpair',{one:pshow!=='both'}]">
            <figure v-for="[m,lab] in SHOWN" :key="m" :class="{von:pmod===m}"><button class="zimg" :aria-label="t('stage.zoom',{x:phName(ph)+' · '+lab})" @click="pmod=m"><img v-if="phImg(ph,m)" :src="phImg(ph,m)" :alt="phName(ph)+' · '+lab" decoding="async"><span v-else class="campend"><Icon n="filter" :size="22"/>{{t('lib.imgPending')}}</span></button><figcaption>{{lab}}</figcaption></figure>
          </div>
          <button class="snav l" :aria-label="t('scene.prev')" @click="pstep(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="pstep(1)">›</button></div>
        <div class="sstrip camstrip">
          <button v-for="p in pafter" :key="p.id" class="cstrip" :aria-selected="p.id===ph.id" @click="cur.photo=p.id">
            <span class="slot"><img v-if="phImg(p,SHOWN[0][0])" :src="phImg(p,SHOWN[0][0])" alt="" loading="lazy" decoding="async"><Icon v-else n="photo" :size="18"/></span>
            <span class="sgl">{{phName(p)}}</span>
          </button>
        </div>
      </div>
      <div v-if="isCam&&big&&!isPhoto&&!isLook" class="sview camview">
        <div class="svhead"><button class="pill" @click="big=false">← {{page==='filter'?t('nav.filter'):t('lib.camBack')}}</button><b>{{t('lib.cam.'+cm.id)}}</b><span class="camsub">{{nm(cm.desc)}}</span><em class="cnt">{{vidx+1}} / {{VIDS.length}}</em></div>
        <div class="slot big"><VPlayer :key="cm.id" :src="cam(cm.id).mp4" :poster="cam(cm.id).jpg" quiet/>
          <button class="snav l" :aria-label="t('scene.prev')" @click="step(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="step(1)">›</button></div>
        <div class="sstrip camstrip">
          <button v-for="c in after" :key="c.id" class="cstrip" :aria-selected="c.id===cm.id" @click="openBig(c.id)">
            <span class="slot"><img :src="cam(c.id).jpg" alt="" loading="lazy" decoding="async"></span>
            <span class="sgl">{{t('lib.cam.'+c.id)}}</span>
          </button>
        </div>
      </div>
      <div v-if="page==='filter'&&!big" class="phtabs">
        <div class="sidetabs" role="tablist" :aria-label="t('nav.filter')">
          <button v-for="g in ['all',...LOOK_CATS]" :key="g" role="tab" :aria-selected="fcat===g" @click="pickCatF(g)">{{t('lib.phCat.'+g)}}</button>
        </div>
        <div class="sidetabs left" role="tablist" :aria-label="t('lib.phShowL')">
          <button v-for="[v,lab] in VSHOW" :key="v" role="tab" :aria-selected="vshow===v" @click="setVshow(v)">{{lab||t('lib.compare')}}</button>
        </div>
      </div>
      <div v-if="isPhoto&&!big" class="phtabs">
        <div class="sidetabs" role="tablist" :aria-label="t('nav.photo')">
          <button v-for="g in ['all',...PHOTO_CATS]" :key="g" role="tab" :aria-selected="pcat===g" @click="pickCatPh(g)">{{t('lib.phCat.'+g)}}</button>
        </div>
        <div class="sidetabs left" role="tablist" :aria-label="t('lib.phShowL')">
          <button v-for="[v,lab] in PSHOW" :key="v" role="tab" :aria-selected="pshow===v" @click="setShow(v)">{{lab||t('lib.compare')}}</button>
        </div>
      </div>
    </section>

    <aside ref="side" class="sprompt" :aria-label="t('lib.prompt')">
      <h2 v-if="isPhoto">{{phName(ph)}}<span class="h2sub">{{nm(phDesc(ph.id))}}</span></h2>
      <h2 v-else>{{title}}<span v-if="isCam" class="h2sub">{{nm(cm.desc)}}</span></h2>
      <div v-if="page==='sheet'" class="pmeta">
        <span class="stg"><i v-for="g in sh.tags" :key="g" :class="'chip tone-'+TONE[g]">{{t('lib.tag.'+g)}}</i></span>
        <template v-if="sh.own">
          <dl class="kv wrap"><dt>{{t('lib.model')}}</dt><dd>{{sh.model}}</dd><dt>{{t('lib.ratio')}}</dt><dd>{{sh.ratio}}</dd><dt>{{t('lib.size')}}</dt><dd>{{sh.size}}</dd><dt>{{t('lib.license')}}</dt><dd>{{t('lib.ownLicense')}}</dd></dl>
          <p class="ownnote">{{t('lib.ownNote')}}</p>
        </template>
        <template v-else-if="sh.from||sh.text">
          <dl class="kv wrap"><dt>{{t('lib.srcL')}}</dt><dd>{{t('lib.m.net')}}</dd><dt>{{t('lib.ratio')}}</dt><dd>3:2</dd><dt>{{t('lib.license')}}</dt><dd>{{sh.lic?t('lib.licNC'):'CC BY-NC-SA 4.0'}}</dd></dl>
          <p class="ownnote">{{t('lib.credit.'+sh.credit)}}<template v-for="([k,u],i) in CREDIT[sh.credit]" :key="u">{{i?' · ':' '}}<a :href="u" target="_blank" rel="noopener">{{t('lib.'+k)}}</a></template><template v-if="!sh.lic"> · <a :href="CCL" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a></template></p>
        </template>
        <dl v-else class="kv"><dt>{{t('lib.model')}}</dt><dd>Krea 2</dd></dl>
      </div>
      <div v-else-if="page==='prompt'" class="pmeta">
        <div class="tabs big" role="tablist" :style="{gridTemplateColumns:'repeat('+VARIANTS(pr.id).length+',1fr)'}">
          <button v-for="v in VARIANTS(pr.id)" :key="v" class="tab" role="tab" :aria-selected="vpick(pr.id)===v" @click="pv[pr.id]=v">{{t('lib.pv.'+v)}}</button>
        </div>
        <p v-if="CREDIT[pr.id]" class="ownnote">{{t('lib.credit.'+pr.id)}} <template v-for="[k,u] in CREDIT[pr.id]" :key="u"><a :href="u" target="_blank" rel="noopener">{{t('lib.'+k)}}</a> · </template><a :href="CCL" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a></p>
        <div v-if="pr.id!=='mimic'&&pr.id!=='vformat'" class="tabs" role="tablist">
          <button v-for="m in PROMPT_MODELS" :key="m" class="tab" role="tab" :aria-selected="pick(pr.id)===m" @click="pm[pr.id]=m">{{t('lib.m.'+m)}}</button>
        </div>
      </div>
      <div v-else-if="isPhoto" class="pmeta">
        <div class="tabs big" role="tablist"><button v-for="[m,lab] in PHOTO_MODELS" :key="m" class="tab" role="tab" :aria-selected="pmod===m" @click="pmod=m">{{lab}}</button></div>
        <span class="stg"><i class="chip tone-shoes">{{PHOTO_MODELS.find(x=>x[0]===pmod)[1]}} · {{t('lib.t2i')}} · 3:2 · {{PHOTO_SIZE}}</i><i v-if="onlyTag" class="chip tone-hair">{{t('lib.'+onlyTag)}}</i></span>
      </div>
      <div v-else class="pmeta">
        <div v-if="cm.sd" class="tabs big" role="tablist"><button v-for="k in ['h3','sd']" :key="k" class="tab" role="tab" :aria-selected="cver===k" @click="setCver(k)">{{k==='h3'?'MiniMax H3':'SD2.0'}}</button></div>
        <span class="stg"><i class="chip tone-shoes">{{camPar}}</i><i v-if="onlyTag" class="chip tone-hair">{{t('lib.'+onlyTag)}}</i></span>
        <span v-if="cm.cat==='other'" class="stg"><i v-for="[k,c] in KEY_TONES" :key="k" :class="'chip tone-'+CAM_TONE[c]">{{t('lib.camKey.'+k)}}</i></span>
      </div>


      <div v-if="!(page==='sheet'&&!sh.own)" class="pbody">
        <pre v-if="isPhoto" class="ptext"><template v-for="(g,k) in camSegs(phTxt,'look')" :key="k"><mark v-if="g.m" :class="'tone-'+CAM_TONE[g.m]">{{g.t}}</mark><template v-else>{{g.t}}</template></template></pre>
        <pre v-else-if="isCam" class="ptext"><template v-for="(g,k) in camSegs(camTxt,cm.cat)" :key="k"><mark v-if="g.m" :class="'tone-'+CAM_TONE[g.m]">{{g.t}}</mark><template v-else>{{g.t}}</template></template></pre>
        <pre v-else class="ptext">{{text}}</pre>
      </div>

      <div v-if="!camSide||isLook" class="pfoot actbar">
        <a v-if="page==='sheet'&&sh.own" class="abtn dl" :href="own(sh.id).png" :download="sh.id+'.png'">{{t('lib.dlPng')}}</a>
        <button v-else-if="page==='sheet'&&pic('sheet/'+sh.id+'__def')" class="abtn dl" @click="dl.ask('sheet',pic('sheet/'+sh.id+'__def'),sh.id+'.webp')">{{t('dl.btn')}}</button>
        <button v-if="!(page==='sheet'&&!sh.own)" class="abtn cp" @click="copy">{{copied?t('scene.copied'):t('lib.copy')}}</button>
      </div>
    </aside>
    <DownloadDlg ref="dl"/>
  </main>
</template>
