<script setup>
/* 锁定：随机一套时不动这一项 */
import {computed} from "vue";
import {state} from "../../lib/store.js";
const p=defineProps({k:String,label:String});
const on=computed(()=>!!state.locks[state.g][p.k]);
const flip=()=>{state.locks[state.g][p.k]=!on.value};
</script>
<template>
  <button class="lock" :aria-pressed="on" :title="$t('panel.lockTip',{x:label})" :aria-label="$t('panel.lock',{x:label})" @click.prevent.stop="flip">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0"/></svg>
  </button>
</template>
