<script setup>
import {copyText} from "../lib/copy.js";
/* 场景：左边按标签筛选的场景卡片；点开一个场景后左边换成大图 + 下方同场景多张图轮播。右边一直是分色提示词和复制按钮 */
import {ref,computed,onMounted,onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import {SCENES,SCENE_TAGS,SCENE_GROUPS,SCENE_VARS} from "../data/scenes.js";
import {sceneSegs,scenePrompt} from "../lib/scenePrompt.js";
import {findImg,imgSrc} from "../lib/images.js";
import Icon from "./Icon.vue";
import DownloadDlg from "./DownloadDlg.vue";
const dl=ref(null);
const {t,locale}=useI18n();
const tag=ref("all"),grp=ref("all"),cur=ref(SCENES[0].id),copied=ref(false),opened=ref(false),vi=ref(0);
/* 左边分类和右边系列一次只亮一个（10-27 用户定）：选系列时分类回到不限，选分类时系列清空 */
const list=computed(()=>SCENES.filter(s=>grp.value!=="all"?s.group===grp.value:(tag.value==="all"||s.tags.includes(tag.value))));
const pickTag=g=>{tag.value=g;grp.value="all";opened.value=false};
const pickGrp=g=>{grp.value=g;tag.value="all";opened.value=false};
const sc=computed(()=>SCENES.find(s=>s.id===cur.value));
const nm=s=>s.name[locale.value]||s.name["zh-CN"];
const img=id=>findImg("scene",id,"def","u");
const pics=computed(()=>SCENE_VARS.map(([v])=>findImg("scene",cur.value,v,"u")));
const open=id=>{cur.value=id;vi.value=0;opened.value=true};
/* 下方一排：当前场景三张用虚线框框住，后面接着排下几个场景（当前筛选里的顺序），点了直接换过去（10-27 用户定） */
const N=SCENE_VARS.length;
const idx=computed(()=>{const i=list.value.findIndex(s=>s.id===cur.value);return i<0?0:i});
const near=k=>{const L=list.value;return L.length?L[(idx.value+k+L.length)%L.length]:null};
const strip=computed(()=>{const L=list.value,out=[sc.value];for(let k=1;k<Math.min(7,L.length);k++)out.push(near(k));return out.filter(Boolean).map(s=>({s,pics:SCENE_VARS.map(([v])=>findImg("scene",s.id,v,"u"))}))});
const go=(id,i)=>{cur.value=id;vi.value=i};
/* 箭头：同场景里翻，翻过第三张就到下一个场景的第一张，往回翻到上一个场景的最后一张 */
const step=d=>{const n=vi.value+d;if(n>=0&&n<N){vi.value=n;return}const s=near(d>0?1:-1);if(s)go(s.id,d>0?0:N-1)};
const onKey=e=>{if(!opened.value||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1)};
onMounted(()=>window.addEventListener("keydown",onKey));onBeforeUnmount(()=>window.removeEventListener("keydown",onKey));
const segs=computed(()=>sceneSegs(cur.value,opened.value?SCENE_VARS[vi.value][0]:"def"));
const copy=()=>{copyText(scenePrompt(cur.value,opened.value?SCENE_VARS[vi.value][0]:"def")).then(ok=>{if(!ok)return;copied.value=true;setTimeout(()=>copied.value=false,1400)})};
const TT={real:"wear",virtual:"person",fantasy:"hair",magic:"detail"};
</script>
<template>
  <main class="scenes" :aria-label="t('nav.scene')">
    <section :class="['slist',{viewing:opened}]">
      <div v-if="!opened" class="sfilter">
        <div class="stags" role="group" :aria-label="t('scene.tagsL')">
          <button class="cap" :aria-pressed="tag==='all'&&grp==='all'" @click="pickTag('all')">{{t('scene.all')}}</button>
          <button v-for="g in SCENE_TAGS" :key="g" :class="'cap tone-'+TT[g]" :aria-pressed="tag===g" @click="pickTag(g)">{{t('scene.tag.'+g)}}</button>
        </div>
        <div class="sgroups" role="group" :aria-label="t('scene.grpL')">
          <button v-for="g in SCENE_GROUPS" :key="g" class="ser" :aria-pressed="grp===g" @click="pickGrp(g)">{{t('scene.grp.'+g)}}</button>
        </div>
      </div>
      <div v-if="!opened" class="sgrid">
        <button v-for="s in list" :key="s.id" class="scard nohl" :aria-pressed="cur===s.id" @click="open(s.id)">
          <div class="slot"><img v-if="img(s.id)" :src="imgSrc(img(s.id).k)" :alt="nm(s)" loading="lazy" decoding="async"><Icon v-else n="scene" :size="22"/><em v-if="img(s.id)" class="bdg">{{t('part.ai')}} · Krea2</em></div>
          <b>{{nm(s)}}</b>
          <span class="stg"><i v-for="g in s.tags" :key="g" :class="'chip tone-'+TT[g]">{{t('scene.tag.'+g)}}</i></span>
        </button>
      </div>
      <div v-else class="sview">
        <div class="svhead"><button class="pill" @click="opened=false">← {{t('scene.back')}}</button><b>{{nm(sc)}}</b><span class="stg"><i v-for="g in sc.tags" :key="g" :class="'chip tone-'+TT[g]">{{t('scene.tag.'+g)}}</i><i class="chip">Krea2</i></span></div>
        <div class="slot big"><img v-if="pics[vi]" :src="imgSrc(pics[vi].k)" :alt="nm(sc)" decoding="async"><Icon v-else n="scene" :size="30"/>
          <button class="snav l" :aria-label="t('scene.prev')" @click="step(-1)">‹</button><button class="snav r" :aria-label="t('scene.next')" @click="step(1)">›</button>
          <em class="bdg">{{vi+1}} / {{pics.length}}</em></div>
        <div class="sstrip">
          <div v-for="(g,gi) in strip" :key="g.s.id" :class="['sgrp',{cur:gi===0}]">
            <span class="sgl">{{nm(g.s)}}</span>
            <div class="sgi">
              <button v-for="(p,i) in g.pics" :key="i" class="slot" :aria-selected="gi===0&&vi===i" :aria-label="nm(g.s)+' '+(i+1)" @click="go(g.s.id,i)"><img v-if="p" :src="imgSrc(p.k)" alt="" loading="lazy" decoding="async"><Icon v-else n="scene" :size="18"/></button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <aside class="sprompt" :aria-label="t('scene.prompt')">
      <h2>{{nm(sc)}}</h2>
      <div class="pbody">
        <p v-for="x in segs" :key="x.h"><b>{{x.h}}：</b><span :class="x.tone?'hl tone-'+x.tone:''">{{x.t}}</span></p>
      </div>
      <div class="pfoot actbar"><button v-if="pics[vi]" class="abtn dl" @click="dl.ask('scene',imgSrc(pics[vi].k),sc.id+'_'+(vi+1)+'.webp')">{{t('dl.btn')}}</button><button class="abtn cp" @click="copy">{{copied?t('scene.copied'):t('lib.copy')}}</button></div>
    </aside>
    <DownloadDlg ref="dl"/>
  </main>
</template>
