<script setup>
/* 站标：XIAGE 本人手绘设计（10-27）。两笔交叉是名字里的 X，左腿 + 右边一竖 + 中间横杠是 A，右边一竖单独看是 I，底下海浪让它成了一艘帆船。
   hl 给了就是讲解小图：只把列出的部分上色（x / a / i / wave），其余变灰；亮的笔画画在灰的上面，不被挡住 */
import {computed} from "vue";
const props=defineProps({size:{type:Number,default:22},w:{type:Number,default:7},hl:{type:Array,default:null}});
const LEG="M30 86C38 64 50 38 72 22",MAST="M74 88C72 62 73 42 82 20",BAR="M16 46C46 48 78 58 104 76",ABAR="M46.3 50.7L49.8 51.5L53.2 52.4L56.6 53.4L60 54.5L63.3 55.6L66.7 56.8L70 58.1L73.3 59.4",WAVE="M14 102q11.5 8 23 0t23 0t23 0t23 0";
/* 每一部分由哪几笔组成 */
const PART={x:[LEG,BAR],a:[LEG,MAST,ABAR],i:[MAST],wave:[WAVE]};
const strokes=computed(()=>{
  const all=[LEG,MAST,BAR,WAVE];
  if(!props.hl)return all.map(d=>({d,c:d===WAVE?"var(--logo-sea,currentColor)":"var(--logo-sail,currentColor)"}));
  const on=new Set(props.hl.flatMap(k=>PART[k]||[]));
  const dim=all.filter(d=>!on.has(d)).map(d=>({d,c:"var(--logo-dim,#8884)"}));
  return [...dim,...[...on].map(d=>({d,c:d===WAVE?"var(--logo-sea,currentColor)":"var(--logo-sail,currentColor)"}))];
});
</script>
<template>
  <svg class="logo" :width="size" :height="size" viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" :stroke-width="w" aria-hidden="true">
    <path v-for="(s,i) in strokes" :key="i" :d="s.d" :stroke="s.c"/>
  </svg>
</template>
