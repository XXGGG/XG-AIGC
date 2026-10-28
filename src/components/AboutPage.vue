<script setup>
/* 「关于」页：先是站标的寓意和来源，再是授权、图片来源、AI 标识、压缩、免责和撤图；内容在 data/about.js，跟着界面语言换。
   每块用左栏同一套类别颜色的圆角框，依次轮换 */
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {ABOUT,LOGO} from "../data/about.js";
import {version} from "../../package.json";
import Logo from "./Logo.vue";
import sketch from "../assets/logo-sketch.png";
const {t,locale}=useI18n();
const secs=computed(()=>ABOUT[locale.value]||ABOUT["zh-CN"]);
const logo=computed(()=>LOGO[locale.value]||LOGO["zh-CN"]);
/* 大字按逗号分成几段，每段不在中间断行（手机上不会断成「之 / 路」） */
const mottoParts=computed(()=>(logo.value.label+logo.value.motto).match(/[^，,:：]+[，,:：]?\s*/g));
/* 文字里的网址变成可点的链接（结尾的句号不算进网址） */
const links=x=>x.split(/(https?:\/\/[^\s，。、）)]+[^\s，。、）).])/).map((t,i)=>i%2?{u:t}:{t});
const TONES=["person","hair","wear","shoes","detail"];
</script>
<template>
  <main class="about" :aria-label="t('nav.about')">
    <article>
      <h2>{{t('app.title')}}</h2>
      <p class="sub">v{{version}} · {{t('app.license')}}</p>
      <section class="logobox">
        <Logo :size="168" :w="6"/>
        <div><h3>{{logo.h}}</h3><p>{{logo.from}}</p></div>
        <div class="lsteps">
          <div v-for="x in logo.parts" :key="x[0]" class="lstep"><Logo :size="88" :w="8" :hl="[x[0]]"/><div><b>{{x[1]}}</b><p>{{x[2]}}</p></div></div>
        </div>
        <figure class="sketch"><img :src="sketch" :alt="logo.sketch" loading="lazy"><figcaption>{{logo.sketch}}</figcaption></figure>
        <p class="motto"><span v-for="(m,i) in mottoParts" :key="i">{{m}}</span></p>
      </section>
      <section v-for="(s,i) in secs" :key="s.h" :class="'tone-'+TONES[i%TONES.length]">
        <h3>{{s.h}}</h3>
        <p v-for="(x,j) in s.p" :key="j"><template v-for="(seg,k) in links(x)" :key="k"><a v-if="seg.u" :href="seg.u" target="_blank" rel="noopener">{{seg.u}}</a><template v-else>{{seg.t}}</template></template></p>
      </section>
    </article>
  </main>
</template>
