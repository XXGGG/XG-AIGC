<script setup>
/* 文字选项：单选直接换；妆容、痣这类可多选，点「无」清空 */
import {S,list,toggleMulti,pickEth} from "../../lib/store.js";
import {MULTI} from "../../lib/catalog.js";
import {nameOf} from "../../lib/names.js";
const p=defineProps({k:String});
const multi=MULTI.includes(p.k);
const on=it=>multi?(it.id==="none"?!S()[p.k].length:S()[p.k].includes(it.id)):S()[p.k]===it.id;
const pick=it=>{if(multi)toggleMulti(p.k,it.id);else if(p.k==="eth")pickEth(it.id);else S()[p.k]=it.id};
</script>
<template>
  <div class="pills"><button v-for="it in list(k)" :key="it.id" class="pill" :aria-pressed="on(it)" @click="pick(it)">{{nameOf(k,it.id)}}</button></div>
</template>
