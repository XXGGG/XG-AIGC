<script setup>
import {copyText} from "../lib/copy.js";
/* 案例页：先是作品列表，点作品才进大屏（10-28 用户定，以后会有很多作品）。
   大屏和场景、三视图同一个版式：左边播当前片段，下面一排片段轮播；右栏是这段的模型、分辨率、秒数、比例、参考图和提示词。
   片段只给在线看，不放下载；提示词只给复制。默认不自动播放，开关记在本机 */
import {ref,computed,watch,onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import {state} from "../lib/store.js";
import {CASES,CASE_REFS,CASE_PLAT} from "../data/cases.js";
import {libPrompt} from "../lib/libPrompt.js";
import Icon from "./Icon.vue";
import VPlayer from "./VPlayer.vue";
import PlatIcon from "./PlatIcon.vue";
const {t,locale}=useI18n();
const nm=o=>o[locale.value]||o["zh-CN"];
const B=import.meta.env.BASE_URL;
const open=ref(false),work=ref(CASES[0].id),cur=ref(CASES[0].clips[0].id),tab=ref("video"),copied=ref(false),bad=ref({});
const cs=computed(()=>CASES.find(c=>c.id===work.value));
/* 上层是固定提示词格式（视频、图片、模仿白模），下层是我的案例（10-30 用户）；选中格式卡时右栏显示格式全文 */
const FMTS=[["vformat","fmt","rig"],["iformat","fmt","look"],["mimic","sd","person"]];
const fmt=ref("");
const fmtTxt=computed(()=>fmt.value?libPrompt(fmt.value,FMTS.find(f=>f[0]===fmt.value)[1]):"");
const L=computed(()=>cs.value.clips);
const idx=computed(()=>Math.max(0,L.value.findIndex(c=>c.id===cur.value)));
const cl=computed(()=>L.value[idx.value]);
const vid=c=>({mp4:B+"cases/"+work.value+"/"+c.id+".mp4",jpg:B+"cases/"+work.value+"/"+c.id+".jpg?v=2"});
const refImg=k=>B+"cases/"+work.value+"/ref/"+k+".webp";
const step=d=>{const n=L.value.length;cur.value=L.value[(idx.value+d+n)%n].id};
const pickWork=id=>{fmt.value="";work.value=id;cur.value=CASES.find(c=>c.id===id).clips[0].id};
const openWork=id=>{pickWork(id);open.value=true};
const rd=()=>{try{return localStorage.getItem("xgw.caseAuto")==="1"}catch{return false}};
const auto=ref(rd());
const flip=()=>{auto.value=!auto.value;try{localStorage.setItem("xgw.caseAuto",auto.value?"1":"0")}catch{}};
watch(cur,()=>{tab.value="video"});
/* 右栏标签：视频提示词 + 带提示词的参考图（三视图、分镜图） */
const tabs=computed(()=>["video",...cl.value.refs.filter(k=>CASE_REFS[k].prompt)]);
const text=computed(()=>fmt.value&&!open.value?fmtTxt.value:tab.value==="video"?cl.value.prompt:CASE_REFS[tab.value].prompt);
const copy=()=>{copyText(text.value).then(ok=>{if(!ok)return;copied.value=true;setTimeout(()=>copied.value=false,1400)})};
const zoomRef=k=>{if(bad.value[k])return;const x=nm(CASE_REFS[k].name);state.zoom={title:x,srcs:[refImg(k)],sheet:true,note:t('cs.refZoom',{x})}};
const ar=c=>c.ratio.replace(":","/");
const onKey=e=>{if(!open.value||state.page!=="cases"||state.zoom||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1);else if(e.key==="Escape"&&!document.fullscreenElement)open.value=false};
window.addEventListener("keydown",onKey);onBeforeUnmount(()=>window.removeEventListener("keydown",onKey));
</script>
<template>
  <main class="scenes" :aria-label="t('nav.cases')">
    <section v-if="!open" class="slist">
      <h3 class="lsech">{{t('cs.fmtH')}}</h3>
      <div class="sgrid wide ptri casefmt">
        <div v-for="[id,,tone] in FMTS" :key="id" :class="['scard','nohl','prow','tone-'+tone]" role="button" tabindex="0" :aria-pressed="fmt===id" @click="fmt=id" @keydown.enter="fmt=id">
          <h3 class="prow-h">{{t('lib.p.'+id)}}</h3>
          <p class="pdesc">{{t('lib.'+id+'Desc')}}</p>
        </div>
      </div>
      <h3 class="lsech">{{t('cs.mineH')}}</h3>
      <div class="sgrid wide casegrid">
        <article v-for="w in CASES" :key="w.id" class="scard nohl" :aria-pressed="!fmt&&w.id===work" @click="pickWork(w.id)" @dblclick="openWork(w.id)">
          <button class="ccover" :aria-label="t('cs.open')+' '+nm(w.title)" @click.stop="openWork(w.id)">
            <span v-for="c in w.clips.slice(0,4)" :key="c.id" class="slot"><img :src="B+'cases/'+w.id+'/'+c.id+'.jpg?v=2'" alt="" loading="lazy" decoding="async"></span>
          </button>
          <div class="scfoot">
            <button class="scsel" @click.stop="openWork(w.id)"><b>{{nm(w.title)}}</b><span class="camsub">{{t('cs.n',{n:w.clips.length})}}</span></button><i class="chip tone-shoes">{{w.clips[0].model}}</i>
          </div>
        </article>
      </div>
    </section>
    <section v-else class="slist viewing">
      <div class="sview camview caseview">
        <div class="svhead">
          <button class="pill" @click="open=false">← {{t('cs.all')}}</button>
          <b>{{nm(cs.title)}}</b>
          <span class="camsub">{{nm(cl.name)}}</span>
          <button class="pill cauto" :aria-pressed="auto" @click="flip">{{t('cs.auto')}} · {{auto?'ON':'OFF'}}</button>
          <em class="cnt">{{idx+1}} / {{L.length}}</em>
        </div>
        <div v-if="cs.links" class="clinks cwatch"><span class="camsub">{{t('cs.watch')}}</span><a v-for="p in CASE_PLAT.filter(p=>cs.links[p])" :key="p" :class="['clink',p]" :href="cs.links[p]" target="_blank" rel="noopener noreferrer"><PlatIcon :p="p"/>{{t('plat.'+p)}} ↗</a>
        </div>
        <div class="slot big"><VPlayer :key="work+cl.id+auto" :src="vid(cl).mp4" :poster="vid(cl).jpg" :autoplay="auto" :loop="false" :style="{aspectRatio:ar(cl)}"/>
          <button class="snav l" :aria-label="t('scene.prev')" @click="step(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="step(1)">›</button></div>
        <div class="sstrip camstrip casestrip" role="tablist" :aria-label="t('cs.list')">
          <button v-for="c in L" :key="c.id" class="cstrip" role="tab" :aria-selected="c.id===cl.id" @click="cur=c.id">
            <span class="slot"><img :src="vid(c).jpg" alt="" loading="lazy" decoding="async"></span>
            <span class="sgl">{{nm(c.name)}}</span>
          </button>
        </div>
      </div>
    </section>

    <aside v-if="!open&&fmt" class="sprompt" :aria-label="t('lib.prompt')">
      <h2>{{t('lib.p.'+fmt)}}</h2>
      <div class="pbody"><pre class="ptext">{{fmtTxt}}</pre></div>
      <div class="pfoot actbar"><button class="abtn cp" @click="copy">{{copied?t('scene.copied'):t('lib.copy')}}</button></div>
    </aside>
    <aside v-else-if="!open" class="sprompt" :aria-label="t('lib.prompt')">
      <h2>{{nm(cs.title)}}</h2>
      <div class="pmeta">
        <dl class="kv wrap"><dt>{{t('cs.model')}}</dt><dd>{{cs.clips[0].model}}</dd><dt>{{t('cs.list')}}</dt><dd>{{t('cs.n',{n:L.length})}}</dd></dl>
        <div v-if="cs.links" class="clinks"><a v-for="p in CASE_PLAT.filter(p=>cs.links[p])" :key="p" :class="['clink',p]" :href="cs.links[p]" target="_blank" rel="noopener noreferrer"><PlatIcon :p="p"/>{{t('plat.'+p)}} ↗</a></div>
      </div>
      <div class="pbody"><ol class="cclips"><li v-for="c in L" :key="c.id">{{nm(c.name)}}<span class="camsub"> · {{t('cs.sec',{n:c.sec})}} · {{c.ratio}}</span></li></ol></div>
      <div class="pfoot actbar"><button class="abtn dl" @click="openWork(cs.id)">{{t('cs.open')}}</button></div>
    </aside>
    <aside v-else class="sprompt" :aria-label="t('lib.prompt')">
      <h2>{{nm(cl.name)}}<span class="h2sub">{{nm(cs.title)}}</span></h2>
      <div class="pmeta">
        <dl class="kv wrap"><dt>{{t('cs.model')}}</dt><dd>{{cl.model}}</dd><dt>{{t('cs.res')}}</dt><dd>{{cl.res}}</dd><dt>{{t('cs.dur')}}</dt><dd>{{t('cs.sec',{n:cl.sec})}}</dd><dt>{{t('cs.ratio')}}</dt><dd>{{cl.ratio}}</dd></dl>
        <div class="crefs" :aria-label="t('cs.refs')">
          <button v-for="(k,i) in cl.refs" :key="k" class="cref" :title="nm(CASE_REFS[k].name)" @click="zoomRef(k)">
            <span class="slot"><img v-if="!bad[k]" :src="refImg(k)" alt="" loading="lazy" decoding="async" @error="bad[k]=1"><Icon v-else n="sheet" :size="18"/></span>
            <span class="sgl"><b>@图片{{i+1}}</b> {{nm(CASE_REFS[k].name)}}</span>
          </button>
        </div>
        <div v-if="tabs.length>1" class="tabs" role="tablist" :style="{gridTemplateColumns:'repeat('+tabs.length+',1fr)'}">
          <button v-for="k in tabs" :key="k" class="tab" role="tab" :aria-selected="tab===k" @click="tab=k">{{k==='video'?t('cs.video'):t('cs.refP',{x:nm(CASE_REFS[k].name)})}}</button>
        </div>
      </div>
      <div class="pbody"><pre class="ptext">{{text}}</pre></div>
      <div class="pfoot actbar"><button class="abtn cp" @click="copy">{{copied?t('scene.copied'):t('lib.copy')}}</button></div>
    </aside>
  </main>
</template>
