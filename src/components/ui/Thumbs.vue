<script setup>
/* 带图的选项格子：发型、饰品、袜子、套装、外套、单衣、下装、连体、鞋子 */
import {state,S,toggleMulti,applySet,currentSet,wearOuter,saveSplit,leaveWhole} from "../../lib/store.js";
import {MULTI,LAYERS,defColor,ck} from "../../lib/catalog.js";
import {findImg,setImg,imgSrc} from "../../lib/images.js";
import {nameOf} from "../../lib/names.js";
import {useI18n} from "vue-i18n";
import {NOTES} from "../../data/notes.js";
import {accBlock,hairOk,hairFor,fixAcc} from "../../lib/acc.js";
const p=defineProps({k:String,items:Array});
const multi=MULTI.includes(p.k);
const LKEY={outer:["outer","oc"],top:["top","tc"],bottom:["bottom","bc"],onepiece:["onepiece","opc"]};

function img(id){
  const s=S(),k=p.k;
  if(id==="none")return null;
  if(k==="hair")return findImg("hair",id,s.haircolor)||findImg("hair",id,"black");
  if(k==="headwear")return findImg("headwear",id,ck(defColor("headwear",id)));
  if(k==="shoes")return findImg("shoes",id,"def");
  if(k==="socks")return findImg("socks",id,"def");
  if(k==="set")return setImg(id);
  if(LAYERS.includes(k)){const [key,ckey]=LKEY[k];return (s[key]===id&&findImg(k,id,ck(s[ckey])))||findImg(k,id,ck(defColor(k,id)))}
  return null;
}
function on(id){
  const s=S(),k=p.k;
  if(multi)return id==="none"?!s[k].length:s[k].includes(id);
  if(k==="set")return currentSet(s)?.id===id;
  if(k==="outer")return id==="none"?!s.outer:s.outer===id;
  if(LAYERS.includes(k))return (k==="onepiece")===(s.mode==="onepiece")&&s[LKEY[k][0]]===id;
  if(k==="hair")return s.hair===id;
  return s[k]===id;
}
function pick(id){
  const s=S(),k=p.k;
  if(k==="headwear"&&accBlock(s,id)==="hair"){
    /* 发型戴不了这件：问一下要不要换成合适的发型，确定了再换 */
    const h=hairFor(id,state.g);
    state.ask={text:t("acc.ask",{h:nameOf("hair",s.hair),a:nameOf("headwear",id),n:nameOf("hair",h)}),ok:()=>{s.hair=h;fixAcc(s);toggleMulti(k,id)}};
    return;
  }
  if(multi)toggleMulti(k,id);
  else if(k==="set")applySet(s,id);
  else if(k==="outer"){leaveWhole(s);wearOuter(s,id)}
  else if(LAYERS.includes(k)){if(k==="onepiece")saveSplit(s);else leaveWhole(s);const [key,ckey]=LKEY[k];s.mode=k==="onepiece"?"onepiece":"split";s[key]=id;s[ckey]=defColor(k,id)}
  else{s[k]=id;if(k==="shoes")s.sc="none";if(k==="hair")fixAcc(s)}
}
/* 只标跨性别的；男女通用的不再标「中性」 */
/* 外套的「不穿」不是目录里的条目，单独给名字 */
const {t}=useI18n();
const label=id=>p.k==="outer"&&id==="none"?t("thumb.noWear"):nameOf(p.k,id);
/* 变暗：饰品和已戴的冲突或发型不合适；发型和已戴的饰品搭不上。变暗的照样能点 */
const dim=id=>{const s=S();if(p.k==="headwear")return !!accBlock(s,id);if(p.k==="hair")return s.headwear.some(x=>!hairOk(x,id));return false};
const {locale}=useI18n();
const note=id=>{const n=NOTES[p.k+"."+id];return n?(n[locale.value]||n["zh-CN"]):""};
const showNote=id=>{state.ask={text:note(id),info:true}};
/* 没出图的选项不显示（10-28 用户：没有图就去掉）；「不戴 / 不穿」和赤脚是文字格，照常显示 */
const shown=it=>it.id==="none"||(p.k==="shoes"&&it.id==="barefoot")||!!img(it.id);
const tag=it=>it.g&&it.g!=="u"&&it.g!==state.g?"cross":"";
</script>
<template>
  <div class="thumbs">
    <button v-for="it in items.filter(shown)" :key="it.id" class="thumb" :class="{dim:dim(it.id)}" :aria-pressed="on(it.id)" :title="label(it.id)" @click="pick(it.id)">
      <i v-if="k==='shoes'&&it.id==='barefoot'" class="txt">{{label(it.id)}}</i>
      <i v-else-if="img(it.id)" class="has"><img :src="imgSrc(img(it.id).k)" alt="" loading="lazy" decoding="async"></i>
      <i v-else>{{it.id==="none"?((k==="outer"||k==="socks")?$t('thumb.noWear'):$t('thumb.none')):$t('thumb.pending')}}</i>
      {{label(it.id)}}<span v-if="note(it.id)" class="info" role="button" tabindex="0" :title="note(it.id)" :aria-label="note(it.id)" @click.stop="showNote(it.id)" @keydown.enter.stop.prevent="showNote(it.id)">ⓘ</span><sup v-if="tag(it)">{{$t('thumb.'+tag(it))}}</sup>
    </button>
  </div>
</template>
