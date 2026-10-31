<script setup>
/* 放大查看：三视图或局部图；Esc、点空白处都能关；「看提示词」打开抽屉，直接跳到这张图那段 */
import {watch,nextTick,ref} from "vue";
import {useI18n} from "vue-i18n";
import {state} from "../lib/store.js";
const {t,locale}=useI18n();
/* 中文、日文句子之间不加空格 */
const join=(...a)=>a.join(/^(zh|ja)/.test(locale.value)?"":" ");
const closeBtn=ref(null);let last=null;
watch(()=>state.zoom,(z,old)=>{
  if(z&&!old){last=document.activeElement;nextTick(()=>closeBtn.value?.focus())}
  if(!z&&old&&last){last.focus();last=null}
});
const close=()=>{state.zoom=null};
const bg=e=>{if(e.target===e.currentTarget||e.target.classList.contains("zb")||e.target.classList.contains("zrow"))close()};
function origin(){const g=state.zoom.go;state.page=g.page;state.jump=g.id;close()}
function prompt(){state.ptab=state.zoom.ptab;state.drawer=true;close()}
</script>
<template>
  <div v-if="state.zoom" class="zoom" role="dialog" aria-modal="true" :aria-label="t('zoom.title')" @click="bg">
    <div class="zh"><span>{{state.zoom.title}}</span><span class="zbtns"><button v-if="state.zoom.go" class="btn" @click="origin">{{t('zoom.origin')}}</button><button v-if="state.zoom.ptab" class="btn" aria-controls="drawer" @click="prompt">{{t('zoom.prompt')}}</button><button ref="closeBtn" class="btn" @click="close">{{t('zoom.close')}}</button></span></div>
    <div class="zb">
      <template v-if="state.zoom.sheet">
        <img v-if="state.zoom.srcs.length" :src="state.zoom.srcs[0]" :alt="state.zoom.title">
        <div v-else class="slot3"><span>{{t('stage.portrait')}}</span><span>{{t('stage.front')}}</span><span>{{t('stage.back')}}</span><em>{{t('stage.pending')}}</em></div>
      </template>
      <div v-else-if="state.zoom.srcs.length" :class="['zrow',{wide:state.zoom.wide}]"><img v-for="src in state.zoom.srcs" :key="src" :src="src" :alt="state.zoom.title"></div>
      <div v-else class="sq">{{t('part.pending')}}</div>
    </div>
    <p class="zc">{{state.zoom.note||join(t('zoom.ai'),t('zoom.compress'))}}</p>
  </div>
</template>
