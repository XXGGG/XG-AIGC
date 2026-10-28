<script setup>
/* 线性小图标：24 格、圆角粗线，跟着文字颜色走 */
defineProps({n:String,size:{type:Number,default:16}});
const P={
  wardrobe:'<path d="M12 7a2 2 0 1 1 2-2"/><path d="M12 7v1.5L3.6 15a1.5 1.5 0 0 0 .9 2.7h15a1.5 1.5 0 0 0 .9-2.7L12 8.5"/>',
  scene:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>',
  video:'<rect x="3" y="5" width="13" height="14" rx="3"/><path d="m16 10 5-3v10l-5-3"/>',
  sheet:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M9 5v14M15 5v14"/>',
  prompt:'<path d="M5 6h14M5 11h14M5 16h8"/><path d="m16 15 2 2 3-4"/>',
  camera:'<rect x="3" y="6" width="12" height="12" rx="3"/><path d="m15 10 6-3.5v11L15 14"/>',
  cases:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  filter:'<circle cx="9" cy="9" r="5.5"/><circle cx="15" cy="15" r="5.5"/>',
  whitebox:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  creators:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c1.7.9 2.8 2.9 3 5.5"/>',
  about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  github:'<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  bilibili:'<rect x="3" y="6" width="18" height="14" rx="4"/><path d="m8 3 2.5 3M16 3l-2.5 3M9 12v1.5M15 12v1.5"/>',
  douyin:'<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.8 2.4 4.6 5 4.8"/>',
  x:'<path d="M4 4l16 16M20 4 4 20"/>',
  expand:'<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
};
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="P[n]"></svg>
</template>
