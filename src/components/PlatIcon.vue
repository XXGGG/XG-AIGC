<script setup>
/* 看成片按钮上的平台小图标，自己画的简化彩色版 */
defineProps({p:String,size:{type:Number,default:16}});
</script>
<template>
  <svg class="plat" :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true">
    <template v-if="p==='bilibili'">
      <path d="m7.5 2.8 2.6 2.6M16.5 2.8l-2.6 2.6" stroke="#00a1d6" stroke-width="2" stroke-linecap="round" fill="none"/>
      <rect x="2" y="5.5" width="20" height="15.5" rx="4.5" fill="#00a1d6"/>
      <rect x="4.6" y="8.1" width="14.8" height="10.3" rx="2.6" fill="#fff"/>
      <path d="m7.6 11.6 2.6.9M16.4 11.6l-2.6.9" stroke="#00a1d6" stroke-width="1.8" stroke-linecap="round"/>
    </template>
    <template v-else-if="p==='douyin'">
      <rect width="24" height="24" rx="6" fill="#111"/>
      <g fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.6 5.2v9.6a3 3 0 1 1-3-3M12.6 5.2c.4 2.2 1.9 3.6 4 3.8" stroke="#25f4ee" transform="translate(-.8 -.6)"/>
        <path d="M12.6 5.2v9.6a3 3 0 1 1-3-3M12.6 5.2c.4 2.2 1.9 3.6 4 3.8" stroke="#fe2c55" transform="translate(.8 .6)"/>
        <path d="M12.6 5.2v9.6a3 3 0 1 1-3-3M12.6 5.2c.4 2.2 1.9 3.6 4 3.8" stroke="#fff"/>
      </g>
    </template>
    <template v-else-if="p==='xhs'">
      <rect width="24" height="24" rx="6" fill="#ff2442"/>
      <text x="12" y="14.4" text-anchor="middle" font-size="6.6" textLength="19" lengthAdjust="spacingAndGlyphs" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">小红书</text>
    </template>
    <template v-else-if="p==='youtube'">
      <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#ff0000"/>
      <path d="M9.8 8.6v6.8l5.8-3.4z" fill="#fff"/>
    </template>
  </svg>
</template>
