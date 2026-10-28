<script setup>
import {copyText} from "../lib/copy.js";
/* 白模视频、画风：先把位置搭好，没有图或视频的地方显示空位（三视图、提示词、运镜在 LibSplit.vue） */
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {state} from "../lib/store.js";
import {WHITEBOX,FILTERS} from "../data/library.js";
import Icon from "./Icon.vue";
const {t,locale}=useI18n();
const nm=o=>o[locale.value]||o["zh-CN"];
const page=computed(()=>state.page);
const copy=txt=>{copyText(txt)};
</script>
<template>
  <main class="lib" :aria-label="t('nav.'+page)">
    <div class="libin">
      <h2>{{t('nav.'+page)}}</h2>

      <template v-if="page==='whitebox'">
        <div class="lgrid wide">
          <article v-for="(c,i) in WHITEBOX" :key="c.id" class="lcard">
            <h3>{{c.name?nm(c.name):t('lib.wb',{n:i+1})}}</h3>
            <div class="pair even">
              <figure><div class="slot r169"><video v-if="c.box" :src="c.box" muted loop playsinline controls preload="metadata"></video><Icon v-else n="whitebox" :size="22"/></div><figcaption>{{t('lib.box')}}</figcaption></figure>
              <figure><div class="slot r169"><video v-if="c.final" :src="c.final" muted loop playsinline controls preload="metadata"></video><Icon v-else n="cases" :size="22"/></div><figcaption>{{t('lib.final')}}</figcaption></figure>
            </div>
            <pre class="ptext" :class="{empty:!c.prompt}">{{c.prompt}}</pre>
            <button class="pill" :disabled="!c.prompt" @click="copy(c.prompt)">{{t('lib.copy')}}</button>
          </article>
        </div>
      </template>

      <template v-else-if="page==='filter'">
        <div class="lgrid">
          <article v-for="(f,i) in FILTERS" :key="f.id" class="lcard">
            <div class="slot r916"><img v-if="f.img" :src="f.img" alt="" loading="lazy"><Icon v-else n="filter" :size="24"/></div>
            <h3>{{f.name?nm(f.name):t('lib.style',{n:i+1})}}</h3>
            <p class="ptext" :class="{empty:!f.story}">{{f.story}}</p>
            <p class="ptext" :class="{empty:!f.key}"><mark v-if="f.key">{{f.key}}</mark>{{f.prompt}}</p>
          </article>
        </div>
      </template>

    </div>
  </main>
</template>
