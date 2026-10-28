<script setup>
import {copyText} from "../lib/copy.js";
/* 提示词抽屉：左边「细节」（面部 / 服装），右边选看哪一段——三视图，或每张局部图各自的提示词。
   提示词只给一份（Krea 2 写法）；局部图的提示词和出图用的是同一份（lib/tilePrompt.js）。可以直接改，改过的按「模型|段」保留，按「按左边重新生成」才丢掉。
   宽屏时面板放在大图右边，细节默认收起，点「细节」才展开；开关按钮在舞台右下角（StagePanel） */
import {computed,ref,watch} from "vue";
import {useI18n} from "vue-i18n";
import {state,S,toggleWd,freshSel,currentSet} from "../lib/store.js";
import {MODELS} from "../data/models.js";
import {buildPrompt,portraitPrompt} from "../lib/prompt.js";
import {hairPrompt,accPrompt,sockLegPrompt,partPrompt,shoePrompt,setPrompt} from "../lib/tilePrompt.js";
import {nameOf} from "../lib/names.js";
import {fragments,segments} from "../lib/highlight.js";
import {MULTI,detailsOf,extraColors,VOC,defColor as defColorOf} from "../lib/catalog.js";
import {colorName} from "../lib/names.js";
import {ETH_LOOK} from "../data/ethnicity.js";
import {WD_MATERIAL} from "../data/wearDetails.js";
import {wornParts} from "../lib/prompt.js";
import Pills from "./ui/Pills.vue";
const props=defineProps({tiles:Array});
const {t}=useI18n();
const model=computed(()=>MODELS.find(m=>m.id===state.model));

/* 每张局部图一段；男生发型、头饰的模板还没做，拼不出来的就不列 */
const tabs=computed(()=>{
  const s=S(),g=state.g,fmt=model.value.fmt,out=[{id:"sheet",label:t("drawer.sheet"),text:()=>buildPrompt(fmt)}];
  for(const tile of props.tiles){
    if(tile.k==="person")out.push({id:"person",label:t("part.person"),text:()=>portraitPrompt()});
    else if(tile.k==="head")out.push({id:"hair",label:t("part.head"),text:()=>hairPrompt(s.hair,s.haircolor,fmt,g)});
    else if(tile.k==="headwear"){const id=tile.hw;out.push({id:"headwear:"+id,label:nameOf("headwear",id),text:()=>accPrompt(id,s.hwc[id])})}
    else if(tile.k==="socks")out.push({id:"socks",label:t("part.socks"),text:()=>sockLegPrompt(s.socks,s.socks==="fishnet"||s.socks==="tights_black"||s.socks==="ruffle"?"f":g)});
    else if(tile.k==="set")out.push({id:"set",label:t("part.set"),text:()=>setPrompt(currentSet(s)?.id,g,fmt)});
    else if(tile.k==="outer")out.push({id:"outer",label:t("part.outer"),text:()=>partPrompt(s.outer,g,s.oc,fmt)});
    else if(tile.k==="top")out.push({id:"top",label:t("part.top"),text:()=>partPrompt(s.top,g,s.tc,fmt)});
    else if(tile.k==="bottom")out.push({id:"bottom",label:t("part.bottom"),text:()=>partPrompt(s.bottom,g,s.bc,fmt)});
    else if(tile.k==="onepiece")out.push({id:"onepiece",label:t("part.onepiece"),text:()=>partPrompt(s.onepiece,g,s.opc,fmt)});
    else if(tile.k==="shoes"&&s.shoes!=="barefoot")out.push({id:"shoes",label:t("part.shoes"),text:()=>shoePrompt(s.shoes,g,s.sc,fmt)});
  }
  return out.filter(x=>x.id==="sheet"||x.text());
});
const tab=computed(()=>tabs.value.find(x=>x.id===state.ptab)||tabs.value[0]);
/* 左边换了东西，原来那段没了就回到三视图 */
watch(tabs,v=>{if(!v.some(x=>x.id===state.ptab))state.ptab="sheet"});
const key=computed(()=>state.model+"|"+tab.value.id);
const edited=computed(()=>state.edited[key.value]);
const text=computed(()=>edited.value!=null?edited.value:tab.value.text());
const box=ref(null),back=ref(null),toast=ref("");
/* 高亮：文字框本身透明，后面垫一层同样排版的彩色文字；改过的文字也照样找词上色 */
/* 刚改动的词：和上一次的片段比，新出现的加虚线框，直到下一次改动（10-27 用户定） */
const chg=ref([]);
watch(()=>fragments().map(f=>f[0]),(n,o)=>{const old=new Set(o||[]);chg.value=o?n.filter(f=>!old.has(f)):[]});
const segs=computed(()=>segments(text.value,fragments(),chg.value));
const LEGEND=[["person","panel.person"],["hair","panel.hair"],["wear","panel.wear"],["shoes","panel.shoes"],["detail","drawer.detail"]];
/* 细节：左边只选大致。面部细节（唇妆、妆容、痣）进人物段；服装细节按当前穿的衣服给，进服装段 */
/* 面部细节分三层：五官 / 妆容 / 皮肤 */
const FACE_GROUPS=[["features",["face","eyes","brows","iris","nose"]],["makeupG",["lips","makeup"]],["skinG",["skin","mark"]],["figureG",["body"]]];
/* 每件衣服：装饰、材质，还有没局部图的补充颜色；鞋子只有补充颜色 */
const CKEY={outer:"oc",top:"tc",bottom:"bc",onepiece:"opc"};
const wearGroups=computed(()=>{
  const s=S();
  const out=wornParts().filter(p=>p[1]).map(([L,id])=>{const o=detailsOf(id);return {L,id,ck:CKEY[L],deco:o.filter(d=>!WD_MATERIAL.includes(d.id)),mat:o.filter(d=>WD_MATERIAL.includes(d.id)),more:[]}});
  if(s.shoes&&s.shoes!=="barefoot")out.push({L:"shoes",id:s.shoes,ck:"sc",deco:[],mat:[],more:[]});
  return out.filter(g=>g.deco.length||g.mat.length||g.more.length);
});
/* 更多颜色：再点一次取消，回到选它之前的颜色（套装里就是套装的颜色） */
const prevC={};
function pickMore(g,c){
  const s=S(),cur=s[g.ck];
  if(cur===c){s[g.ck]=prevC[g.ck+g.id]??(g.L==="shoes"?"none":defColorOf(g.L,g.id));return}
  if(!g.more.includes(cur))prevC[g.ck+g.id]=cur;
  s[g.ck]=c;
}
const wdOn=(id,d)=>(S().wd[id]||[]).includes(d);
/* 「细节」按钮上显示已经加了几项（素唇是默认，不算） */
const DEF0={f:freshSel("f"),m:freshSel("m")};
/* 默认按人种：选人种时五官、肤色会跟着换，跟着换的不算 */
const nDetail=computed(()=>{const s=S(),d={...DEF0[state.g],...((ETH_LOOK[s.eth]||{})[state.g]||{})};const wc=wearGroups.value.filter(g=>g.more.includes(s[g.ck])).length;return s.makeup.length+s.mark.length+["face","eyes","brows","iris","nose","lips","skin","body"].filter(k=>s[k]!==d[k]).length+wornParts().reduce((n,p)=>n+((s.wd[p[1]]||[]).length),0)+wc});
const sync=()=>{if(back.value)back.value.scrollTop=box.value.scrollTop};
let timer=0;
function say(m){toast.value=m;clearTimeout(timer);timer=setTimeout(()=>toast.value="",2400)}
const regen=()=>{delete state.edited[key.value]};
function copy(){
  const fallback=()=>{box.value.focus();box.value.select();toast.value=t("drawer.select")};
  copyText(box.value.value).then(ok=>ok?say(t("drawer.copied")):fallback())
}
</script>

<template>
  <section id="drawer" :class="['drawer',{open:state.drawer}]" :aria-label="t('drawer.title')" :inert="!state.drawer||null">
    <div class="phead">
      <div class="tabs subtabs" role="tablist" :aria-label="t('drawer.part')">
        <button v-for="x in tabs" :key="x.id" class="tab" role="tab" :aria-selected="tab.id===x.id" @click="state.ptab=x.id">{{x.label}}</button>
      </div>
      <button class="ibtn pclose" :title="t('stage.hide')" :aria-label="t('stage.hide')" aria-controls="drawer" :aria-expanded="state.drawer" @click="state.drawer=false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16M8 10l2 2-2 2"/></svg></button>
    </div>
    <div class="legend" :aria-label="t('drawer.legend')"><span v-for="l in LEGEND" :key="l[0]" :class="'lg tone-'+l[0]">{{t(l[1])}}</span><span class="toast" aria-live="polite">{{toast}}</span></div>
    <div v-if="edited!=null" class="editbar"><span>{{t('drawer.edited')}}</span><button class="btn" @click="regen">{{t('drawer.regen')}}</button></div>
    <div class="pbox">
      <div ref="back" class="prompt pback" aria-hidden="true"><span v-for="(g,i) in segs" :key="i" :class="[g.c&&'hl tone-'+g.c,g.x&&'chg']">{{g.t}}</span>{{"\n"}}</div>
      <textarea ref="box" class="prompt pfront" spellcheck="false" :aria-label="t('drawer.aria')" :value="text" @input="state.edited[key]=$event.target.value" @scroll="sync"></textarea>
    </div>
    <!-- 细节：从右往左滑出的浮空面板，盖在预览区右半边、提示词左边，不挤压预览图（10-27 用户定） -->
    <Transition name="dslide">
    <aside v-show="state.showDetail" id="details" class="details tone-detail" :aria-label="t('drawer.detail')">
      <div class="dhead"><h2>{{t('drawer.detail')}}</h2><button class="ibtn" :aria-label="t('zoom.close')" @click="state.showDetail=false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="dcols">
        <section class="dcol">
          <h3>{{t('drawer.face')}}</h3>
          <div v-for="[gk,ks] in FACE_GROUPS" :key="gk" class="dlayer">
            <h4 class="dl">{{t('dgrp.'+gk)}}</h4>
            <div v-for="k in ks" :key="k" class="dgroup"><h5>{{t('field.'+k)}}<small v-if="MULTI.includes(k)">{{t('panel.multi')}}</small></h5><Pills :k="k"/></div>
          </div>
        </section>
        <section class="dcol">
          <h3>{{t('drawer.wear')}}</h3>
          <div v-for="g in wearGroups" :key="g.id" class="dlayer">
            <h4 class="dl">{{t('part.'+g.L)}} · {{nameOf(g.L,g.id)}}</h4>
            <div v-if="g.deco.length" class="dgroup"><h5>{{t('dgrp.deco')}}<small>{{t('panel.multi')}}</small></h5><div class="pills"><button v-for="d in g.deco" :key="d.id" class="pill" :aria-pressed="wdOn(g.id,d.id)" @click="toggleWd(g.id,d.id)">{{nameOf('wd',d.id)}}</button></div></div>
            <div v-if="g.more.length" class="dgroup"><h5>{{t('dgrp.more')}}</h5><div class="pills"><button v-for="c in g.more" :key="c" class="pill cpill" :aria-pressed="S()[g.ck]===c" @click="pickMore(g,c)"><i :style="{background:VOC[c].hex}"></i>{{colorName(c)}}</button></div></div>
            <div v-if="g.mat.length" class="dgroup"><h5>{{t('dgrp.mat')}}<small>{{t('panel.multi')}}</small></h5><div class="pills"><button v-for="d in g.mat" :key="d.id" class="pill" :aria-pressed="wdOn(g.id,d.id)" @click="toggleWd(g.id,d.id)">{{nameOf('wd',d.id)}}</button></div></div>
          </div>
        </section>
      </div>
    </aside>
    </Transition>
    <div class="pfoot actbar">
      <button :class="['abtn','dt','dtoggle',{on:state.showDetail}]" :aria-expanded="state.showDetail" aria-controls="details" @click="state.showDetail=!state.showDetail">{{t('drawer.detail')}}<b v-if="nDetail">{{nDetail}}</b><svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 7.5 6 4l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
      <button class="abtn cp" @click="copy">{{t('drawer.copy')}}</button>
    </div>
  </section>
</template>
