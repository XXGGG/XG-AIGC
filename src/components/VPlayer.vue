<script setup>
/* 站内自己的播放条：播放暂停、进度（可拖）、静音、全屏；不用浏览器自带控件 */
import {ref,onMounted} from "vue";
import {useI18n} from "vue-i18n";
const props=defineProps({src:String,poster:String,autoplay:{type:Boolean,default:true},loop:{type:Boolean,default:true},quiet:{type:Boolean,default:false}});
/* quiet：演示视频默认静音，需要时自己点开声音（10-30 用户：电锯声会吓到人） */
const {t}=useI18n();
const box=ref(null),v=ref(null),playing=ref(false),muted=ref(props.quiet),pos=ref(0),dur=ref(0);
const fmt=s=>{s=Math.floor(s||0);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const toggle=()=>{const x=v.value;if(x.paused)x.play().catch(()=>{});else x.pause()};
const seek=e=>{v.value.currentTime=+e.target.value};
const mute=()=>{muted.value=!muted.value;v.value.muted=muted.value};
/* 不循环时播完回到第 0 秒停住，画面停在首帧 */
const end=()=>{const x=v.value;x.pause();x.currentTime=0;pos.value=0};
const full=()=>{if(document.fullscreenElement)document.exitFullscreen();else box.value.requestFullscreen?.()};
onMounted(()=>{if(!props.autoplay)return;v.value.play().catch(()=>{v.value.muted=true;muted.value=true;v.value.play().catch(()=>{})})});
</script>
<template>
  <div ref="box" class="vp">
    <video ref="v" :src="src" :muted="muted" :poster="poster" :loop="loop" playsinline disablepictureinpicture @click="toggle" @play="playing=true" @pause="playing=false" @timeupdate="e=>pos=e.target.currentTime" @ended="end" @loadedmetadata="e=>dur=e.target.duration"></video>
    <div class="vpbar">
      <button class="vpb" :aria-label="playing?t('vp.pause'):t('vp.play')" @click="toggle">
        <svg v-if="playing" viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16"><path d="M7 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L8.5 4.6A1 1 0 0 0 7 5.5z"/></svg>
      </button>
      <span class="vpt">{{fmt(pos)}} / {{fmt(dur)}}</span>
      <input class="vpr" type="range" min="0" :max="dur||0" step="0.01" :value="pos" :aria-label="t('vp.seek')" @input="seek">
      <button class="vpb" :aria-label="muted?t('vp.unmute'):t('vp.mute')" @click="mute">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path v-if="!muted" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path v-else d="m16 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
      <button class="vpb" :aria-label="t('vp.full')" @click="full">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
      </button>
    </div>
  </div>
</template>
