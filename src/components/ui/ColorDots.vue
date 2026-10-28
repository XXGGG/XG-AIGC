<script setup>
/* 颜色：左栏底部的大圆点。只给这件东西常见的几种；斜纹圆点 =「不指定」，提示词里不写颜色 */
import {VOC,HC} from "../../lib/catalog.js";
import {colorName,hairColorName} from "../../lib/names.js";
const p=defineProps({opts:Array,cur:String,label:String,hair:Boolean});
defineEmits(["pick"]);
const name=c=>p.hair?hairColorName(c):colorName(c);
const hex=c=>(p.hair?HC[c]:VOC[c]).hex;
</script>
<template>
  <div class="drow">
    <span class="lbl">{{label}} · <b>{{name(cur)}}</b></span>
    <div class="dots" role="radiogroup" :aria-label="label">
      <button v-for="c in opts" :key="c" class="dot" role="radio" :aria-checked="cur===c" :title="name(c)" :aria-label="name(c)" @click="$emit('pick',c)">
        <i :class="{nd:c==='none'}" :style="c==='none'?null:{background:hex(c)}"></i>
      </button>
    </div>
  </div>
</template>
