<script setup>
/* 折叠：开合记在 state.open 里，切 Tab、重画都不丢。大折叠是手风琴：打开一个，其它大折叠收起；tone 给大折叠配一种底色，和提示词里的高亮颜色对应 */
import {state} from "../../lib/store.js";
const p=defineProps({k:{type:String,required:true},title:String,val:String,big:Boolean,tone:String});
const BIG=["person","hairbox","acc","wtop","wbot","wset","shoes","socks"];
function toggle(e){
  const open=e.target.open;
  if(!!state.open[p.k]===open)return;
  state.open[p.k]=open;
  if(open&&p.big)BIG.forEach(k=>{if(k!==p.k)state.open[k]=false});
}
</script>
<template>
  <details :class="[big?'big':'small',tone&&'tone-'+tone]" :open="!!state.open[k]" @toggle="toggle">
    <summary><span>{{title}}</span><span class="val">{{val}}</span><slot name="lock"/></summary>
    <div :class="big?'bigbody':'smallbody'"><slot/></div>
  </details>
</template>
