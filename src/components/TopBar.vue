<script setup>
/* 顶部主导航：左边 Logo + 栏目（每个前面一个线性小图标），右边语言、推荐、关于、GitHub 图标 */
import {useI18n} from "vue-i18n";
import {state} from "../lib/store.js";
import {LOCALES,setLocale} from "../i18n/index.js";
import {ref} from "vue";
import {version} from "../../package.json";
import Icon from "./Icon.vue";
import Logo from "./Logo.vue";
const {t,locale}=useI18n();
const NAV=["wardrobe","scene","sheet","prompt","camera","filter","whitebox","cases"];
/* 画风·滤镜、白模视频暂时不开（10-27 用户定）：点了不切页，屏幕正中弹出「敬请期待」，没有蒙版，停一下再往上淡出 */
const SOON=["filter","whitebox"];
/* 推荐挪到右边、关于旁边（10-28 用户） */
const PAGES=[...NAV.filter(k=>!SOON.includes(k)),"creators","about"];
const soon=ref(0);let st=0;
const go=k=>{
  if(SOON.includes(k)){soon.value++;clearTimeout(st);st=setTimeout(()=>soon.value=0,1900);return}
  if(PAGES.includes(k))state.page=k;
};
</script>
<template>
  <header class="top">
    <button class="brand" :aria-label="t('app.title')" @click="go('wardrobe')">
      <Logo :size="26" :w="9"/>
      <h1>{{t('app.title')}}</h1>
    </button>
    <nav class="nav" :aria-label="t('app.nav')">
      <button v-for="k in NAV" :key="k" :aria-current="state.page===k?'page':null" :title="SOON.includes(k)?t('app.stay'):null" @click="go(k)"><Icon :n="k" :size="15"/>{{t('nav.'+k)}}</button>
    </nav>
    <div class="tright">
      <label class="langsel"><span class="sr">{{t('app.lang')}}</span>
        <Icon n="globe" :size="15"/>
        <select :value="locale" @change="setLocale($event.target.value)"><option v-for="[v,n] in LOCALES" :key="v" :value="v">{{n}}</option></select>
      </label>
      <nav class="nav" :aria-label="t('nav.about')">
        <button :aria-current="state.page==='creators'?'page':null" @click="go('creators')"><Icon n="creators" :size="15"/>{{t('nav.creators')}}</button>
        <button :aria-current="state.page==='about'?'page':null" @click="go('about')"><Icon n="about" :size="15"/>{{t('nav.about')}}</button>
      </nav>
      <a class="ibtn" href="https://github.com/XXGGG/XG-AIGC" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub"><Icon n="github" :size="17"/></a>
      <span class="meta">v{{version}}</span>
    </div>
  </header>
  <div v-if="soon" :key="soon" class="soontoast" role="status">{{t('app.stay')}}</div>
</template>
