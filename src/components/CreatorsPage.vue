<script setup>
/* 推荐：博主（头像、名字、简介、各平台主页）和平台（非会员能不能生成视频、每天送多少积分、每秒多少积分、官网），底部分栏切换 */
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {CREATORS} from "../data/creators.js";
import {PLATFORMS,PLAT_NOTE} from "../data/platforms.js";
import Icon from "./Icon.vue";
const {t}=useI18n();
const PLAT=["bilibili","douyin","x"];
/* 头像还没下载到的，显示名字第一个字 */
const noAv=ref({});
/* 10-28 用户：博主和平台分开看，底部浮动分栏切换（和三视图页一样） */
const tab=ref("creators");
const ico=id=>"platforms/"+id+".png";
</script>
<template>
  <main class="creators">
    <div class="recs">
    <section v-if="tab==='creators'">
    <h2>{{t('rec.creators')}}</h2>
    <div class="cgrid">
      <article v-for="c in CREATORS" :key="c.id" class="ccard">
        <img v-if="c.avatar&&!noAv[c.id]" class="cav" :src="c.avatar" :alt="c.name" width="56" height="56" loading="lazy" referrerpolicy="no-referrer" @error="noAv[c.id]=true">
        <span v-else class="cav cav0" aria-hidden="true">{{[...c.name][0]}}</span>
        <div class="cinfo">
          <h3>{{c.name}}</h3>
          <p>{{c.intro}}</p>
        </div>
        <div class="clinks">
          <template v-for="p in PLAT" :key="p">
            <a v-if="c.links[p]" :class="'clink '+p" :href="c.links[p]" target="_blank" rel="noopener noreferrer"><Icon :n="p" :size="14"/>{{t('plat.'+p)}}</a>
          </template>
        </div>
      </article>
    </div>
    </section>
    <section v-else>
    <h2>{{t('rec.platforms')}}</h2>
    <p class="pnote">{{PLAT_NOTE}}</p>
    <div class="pgrid">
      <article v-for="p in PLATFORMS" :key="p.id" class="pfcard">
        <div class="pfhead">
          <img class="pfico" :src="ico(p.id)" :alt="p.name" width="44" height="44" loading="lazy">
          <h3>{{p.name}}</h3>
          <a class="clink" :href="p.url" target="_blank" rel="noopener noreferrer">{{t('rec.site')}} ↗</a>
        </div>
        <p :class="['pfkey',p.ok?'ok':'no']">{{p.head}}</p>
        <ul v-if="p.free||p.more">
          <li v-if="p.free"><b>{{p.free}}</b><ul v-if="p.sub"><li v-for="(l,i) in p.sub" :key="i">{{l}}</li></ul></li>
          <li v-for="(l,i) in p.more||[]" :key="'m'+i">{{l}}</li>
        </ul>
      </article>
    </div>
    </section>
    </div>
    <div class="sidetabs" role="tablist" :aria-label="t('nav.creators')">
      <button v-for="v in ['creators','platforms']" :key="v" role="tab" :aria-selected="tab===v" @click="tab=v">{{t('rec.'+v)}}</button>
    </div>
  </main>
</template>
