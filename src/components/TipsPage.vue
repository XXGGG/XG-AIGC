<script setup>
/* 技巧页（10-31 用户定）：顶部导航单独一栏，先放四个固定提示词格式（从案例页挪来），以后还会加别的技巧。
   点卡右栏显示全文 + 复制，和案例页同一个版式 */
import {ref,computed} from "vue";
import {useI18n} from "vue-i18n";
import {copyText} from "../lib/copy.js";
import {libPrompt} from "../lib/libPrompt.js";
const {t}=useI18n();
/* [id, libPrompt 的第二个参数, 卡片颜色] */
const FMTS=[["vformat","fmt","rig"],["h3format","fmt","hair"],["iformat","fmt","look"],["mimic","sd","person"]];
const rd=()=>{try{const v=localStorage.getItem("xgw.tip");return FMTS.some(f=>f[0]===v)?v:FMTS[0][0]}catch{return FMTS[0][0]}};
const cur=ref(rd()),copied=ref(false);
const pick=id=>{cur.value=id;try{localStorage.setItem("xgw.tip",id)}catch{}};
const txt=computed(()=>libPrompt(cur.value,FMTS.find(f=>f[0]===cur.value)[1]));
const copy=()=>{copyText(txt.value).then(ok=>{if(!ok)return;copied.value=true;setTimeout(()=>copied.value=false,1400)})};
</script>
<template>
  <main class="scenes" :aria-label="t('nav.tips')">
    <section class="slist">
      <h3 class="lsech">{{t('cs.fmtH')}}</h3>
      <div class="sgrid wide ptri casefmt">
        <div v-for="[id,,tone] in FMTS" :key="id" :class="['scard','nohl','prow','tone-'+tone]" role="button" tabindex="0" :aria-pressed="cur===id" @click="pick(id)" @keydown.enter="pick(id)">
          <h3 class="prow-h">{{t('lib.p.'+id)}}</h3>
          <p class="pdesc">{{t('lib.'+id+'Desc')}}</p>
        </div>
      </div>
    </section>
    <aside class="sprompt" :aria-label="t('lib.prompt')">
      <h2>{{t('lib.p.'+cur)}}</h2>
      <div class="pbody"><pre class="ptext">{{txt}}</pre></div>
      <div class="pfoot actbar"><button class="abtn cp" @click="copy">{{copied?t('scene.copied'):t('lib.copy')}}</button></div>
    </aside>
  </main>
</template>
