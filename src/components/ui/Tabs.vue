<script setup>
defineProps({opts:Array,cur:String,sub:Boolean,big:Boolean,label:String});
defineEmits(["pick"]);
</script>
<template>
  <div :class="['tabs',{subtabs:sub,big}]" role="tablist" :aria-label="label">
    <button v-for="[v,text] in opts" :key="v" class="tab" role="tab" :aria-selected="cur===v" @click="$emit('pick',v)">{{text}}</button>
  </div>
</template>
