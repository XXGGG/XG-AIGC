<script setup>
import {copyText} from "../lib/copy.js";
/* 三视图、提示词、运镜三页：和场景页同一个版式（10-27 用户定「完全靠右」）。
   左边筛选 + 卡片网格，点一张卡选中；右栏固定显示这张卡的提示词和复制按钮 */
import {ref,computed,watch,nextTick,onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import {state} from "../lib/store.js";
import {SHEETS,SHEET_TAGS,OWN_TAGS,FAN_TAGS,OWN_SHEETS,PROMPTS,PROMPT_MODELS} from "../data/library.js";
import {CAMERA,CAM_CATS,CAM_PARAMS,ACTOR,CAM_TONE,camSegs} from "../data/camera.js";
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
const cur=ref({sheet:(ALL.find(c=>!c.own)||ALL[0]).id,prompt:PROMPTS[0].id,camera:CAMERA[0].id});
/* 窄屏时提示词栏在列表下面，点卡片后滚过去 */
const side=ref(null);
const sel=(id,go)=>{cur.value[page.value]=id;if(go&&window.innerWidth<=900)nextTick(()=>side.value?.scrollIntoView({behavior:"smooth",block:"start"}))};
const on=id=>cur.value[page.value]===id;
const sh=computed(()=>ALL.find(c=>c.id===cur.value.sheet));
const pr=computed(()=>PROMPTS.find(p=>p.id===cur.value.prompt));
const cm=computed(()=>CAMERA.find(c=>c.id===cur.value.camera));
/* 运镜卡：鼠标移上去静音循环预览，移开停在开头；只有点右下角放大才在左边大屏看（10-27 用户定） */
const big=ref(false);
const hover=(e,go)=>{const v=e.currentTarget.querySelector("video");if(!v)return;if(go){v.play().catch(()=>{})}else{v.pause();v.currentTime=0}};
const openBig=id=>{cur.value.camera=id;big.value=true};
watch(page,()=>{big.value=false;sbig.value=false});
/* 运镜页顶部分组筛选：只列出已经有条目的分组 */
const ccat=ref("move");
const CATS=CAM_CATS.filter(k=>CAMERA.some(c=>c.cat===k));
const camList=computed(()=>CAMERA.filter(c=>c.cat===ccat.value));
const pickCat=k=>{ccat.value=k;const f=CAMERA.find(c=>c.cat===k);if(f)cur.value.camera=f.id};
const CT=CAM_TONE;
/* 大屏里左右切换（只在已有视频的运镜之间），下面一排从当前这条往后排 */
const VID=CAMERA.filter(c=>c.video);
const vidx=computed(()=>Math.max(0,VID.findIndex(c=>c.id===cur.value.camera)));
const step=d=>{cur.value.camera=VID[(vidx.value+d+VID.length)%VID.length].id};
const after=computed(()=>VID.map((_,k)=>VID[(vidx.value+k)%VID.length]));
const onKey=e=>{if(sbig.value&&page.value==="sheet"&&!/INPUT|TEXTAREA/.test(e.target.tagName)&&!state.zoom){if(e.key==="ArrowRight")sstep(1);else if(e.key==="ArrowLeft")sstep(-1);else if(e.key==="Escape")sbig.value=false;return}
  if(!big.value||page.value!=="camera"||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1);else if(e.key==="Escape"&&!document.fullscreenElement)big.value=false};
window.addEventListener("keydown",onKey);onBeforeUnmount(()=>window.removeEventListener("keydown",onKey));
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
const text=computed(()=>page.value==="sheet"?(sh.value.own?sh.value.prompt:sh.value.from?libPrompt(...sh.value.from,"gpt"):sh.value.prompt||sheetPrompt(sh.value.id)):page.value==="prompt"?libPrompt(pr.value.id,vpick(pr.value.id),pick(pr.value.id)):cm.value.prompt);
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
  <main class="scenes" :aria-label="t('nav.'+page)">
    <section :class="['slist',{withtabs:page==='sheet'||page==='prompt',viewing:(page==='camera'&&big)||(page==='sheet'&&sbig)}]">

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
          <div :class="['pair','tri',p.id==='fromchar'?'three32':p.id==='outfit'?'quad4':'quad',{tall:TALL.has(p.id)}]">
            <figure v-for="[k,r,v] in figs(p.id)" :key="k" :class="{von:v&&on(p.id)&&vpick(p.id)===v}" @click.stop="pickV(p.id,v)"><div :class="'slot '+r"><img v-if="pic('prompt/'+p.id+'__'+k)" :src="pic('prompt/'+p.id+'__'+k)" alt="" loading="lazy"><Icon v-else :n="r==='r32'?'sheet':'scene'" :size="22"/></div><figcaption>{{v?t('lib.pv.'+v):k==='ref'?t('lib.refImg'):t('lib.before')}}</figcaption></figure>
          </div>
        </div>
      </div>
      <div class="sidetabs left" role="tablist" :aria-label="t('lib.colsL')">
        <button v-for="n in [1,2]" :key="n" class="colbtn" role="tab" :aria-selected="pcols===n" :aria-label="t('lib.cols'+n)" :title="t('lib.cols'+n)" @click="setCols(n)"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect v-if="n===1" x="2.5" y="3.5" width="13" height="11" rx="2"/><template v-else><rect x="1.8" y="3.5" width="6.2" height="11" rx="1.6"/><rect x="10" y="3.5" width="6.2" height="11" rx="1.6"/></template></svg></button>
      </div>
      </template>

      <div v-else-if="!big" class="sfilter">
        <div class="stags" role="group" :aria-label="t('lib.tagsL')">
          <button v-for="k in CATS" :key="k" :class="'cap tone-'+CT[k]" :aria-pressed="ccat===k" @click="pickCat(k)">{{t('lib.camCat.'+k)}}</button>
        </div>
      </div>
      <div v-if="page==='camera'&&!big" ref="grid" class="sgrid wide">
        <article v-for="c in camList" :key="c.id" class="scard" :class="{on:on(c.id)}" @click="sel(c.id)" @mouseenter="hover($event,1)" @mouseleave="hover($event,0)">
          <div class="slot r169"><video v-if="c.video" :src="cam(c.id).mp4" :poster="cam(c.id).jpg" muted loop playsinline preload="none" disablepictureinpicture></video><span v-else class="campend"><Icon n="camera" :size="22"/>{{t('lib.camPending')}}</span></div>
          <div class="scfoot">
            <button class="scsel" :aria-pressed="on(c.id)" @click.stop="sel(c.id,1)"><b>{{t('lib.cam.'+c.id)}}</b><span class="camsub">{{nm(c.desc)}}</span></button>
            <button v-if="c.video" class="cbig" :aria-label="t('lib.camBig')" :title="t('lib.camBig')" @click.stop="openBig(c.id)"><Icon n="expand" :size="16"/></button>
          </div>
        </article>
      </div>
      <div v-if="page==='camera'&&big" class="sview camview">
        <div class="svhead"><button class="pill" @click="big=false">← {{t('lib.camBack')}}</button><b>{{t('lib.cam.'+cm.id)}}</b><span class="camsub">{{nm(cm.desc)}}</span><em class="cnt">{{vidx+1}} / {{VID.length}}</em></div>
        <div class="slot big"><VPlayer :key="cm.id" :src="cam(cm.id).mp4" :poster="cam(cm.id).jpg"/>
          <button class="snav l" :aria-label="t('scene.prev')" @click="step(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="step(1)">›</button></div>
        <div class="sstrip camstrip">
          <button v-for="c in after" :key="c.id" class="cstrip" :aria-selected="c.id===cm.id" @click="openBig(c.id)">
            <span class="slot"><img :src="cam(c.id).jpg" alt="" loading="lazy" decoding="async"></span>
            <span class="sgl">{{t('lib.cam.'+c.id)}}</span>
          </button>
        </div>
      </div>
    </section>

    <aside ref="side" class="sprompt" :aria-label="t('lib.prompt')">
      <h2>{{title}}<span v-if="page==='camera'" class="h2sub">{{nm(cm.desc)}}</span></h2>
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
        <div class="tabs" role="tablist">
          <button v-for="m in PROMPT_MODELS" :key="m" class="tab" role="tab" :aria-selected="pick(pr.id)===m" @click="pm[pr.id]=m">{{t('lib.m.'+m)}}</button>
        </div>
      </div>
      <div v-else class="pmeta">
        <span class="stg"><i class="chip tone-shoes">{{CAM_PARAMS}}</i></span>
      </div>


      <div v-if="!(page==='sheet'&&!sh.own)" class="pbody">
        <pre v-if="page==='camera'" class="ptext"><template v-for="(g,k) in camSegs(cm.prompt,cm.cat)" :key="k"><mark v-if="g.m" :class="'tone-'+CAM_TONE[g.m]">{{g.t}}</mark><template v-else>{{g.t}}</template></template></pre>
        <pre v-else class="ptext">{{text}}</pre>
      </div>

      <div v-if="page!=='camera'" class="pfoot actbar">
        <a v-if="page==='sheet'&&sh.own" class="abtn dl" :href="own(sh.id).png" :download="sh.id+'.png'">{{t('lib.dlPng')}}</a>
        <button v-else-if="page==='sheet'&&pic('sheet/'+sh.id+'__def')" class="abtn dl" @click="dl.ask('sheet',pic('sheet/'+sh.id+'__def'),sh.id+'.webp')">{{t('dl.btn')}}</button>
        <button v-if="!(page==='sheet'&&!sh.own)" class="abtn cp" @click="copy">{{copied?t('scene.copied'):t('lib.copy')}}</button>
      </div>
    </aside>
    <DownloadDlg ref="dl"/>
  </main>
</template>
