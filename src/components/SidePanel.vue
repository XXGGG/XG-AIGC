<script setup>
/* 左栏：人物 / 发型 / 饰品 / 上装 / 下装 / 套装 / 鞋子 七个大折叠，框内滚动；底部两个开关。不放给开发看的备注小字 */
import {computed,ref,watch} from "vue";
import {useI18n} from "vue-i18n";
import {state,S,list,get,currentSet,getPart,resetSel} from "../lib/store.js";
import {hcOk} from "../lib/acc.js";
import {MULTI,HAIR_COLORS,OUTFIT_GROUPS,ANCIENT_HAIR,colorOpts,setOnly} from "../lib/catalog.js";
import {colorName,hairColorName,cname,nameOf} from "../lib/names.js";
import Fold from "./ui/Fold.vue";
import Tabs from "./ui/Tabs.vue";
import Pills from "./ui/Pills.vue";
import ColorDots from "./ui/ColorDots.vue";
import Thumbs from "./ui/Thumbs.vue";
import LockBtn from "./ui/LockBtn.vue";
import {randomize} from "../lib/random.js";
import {SHOE_GROUPS} from "../data/shoes.js";
import {ACC_GROUPS,HAIR_GROUPS} from "../data/hair.js";

const {t}=useI18n();
const s=computed(()=>S());
/* 左栏只放点了有局部图变化的：人种和年龄（有头像）；五官、肤色、身材都在细节面板（10-27 用户定） */
const PERSON_FIELDS=["eth","age"];
const nm=k=>MULTI.includes(k)?s.value[k].map(id=>nameOf(k,id)).join("、"):nameOf(k,s.value[k]);

/* 人物 */
const genderLabel=computed(()=>state.gmode==="custom"?(state.custom||t("panel.custom")):t(state.g==="f"?"panel.female":"panel.male"));
const setGender=(v,g)=>{state.gmode=v;if(g)state.g=g};
const personFields=PERSON_FIELDS;

/* 发型 */
const hairGroups=computed(()=>{const all=list("hair");return HAIR_GROUPS.map(([k,ids])=>({k,items:ids.map(id=>all.find(x=>x.id===id)).filter(Boolean)})).filter(g=>g.items.length)});
const hairVal=computed(()=>hairColorName(s.value.haircolor)+" · "+nm("hair"));

/* 饰品：发饰 / 帽子 / 眼镜 / 首饰，全部列出来，类之间一条淡横线；最上面一格「不戴」清空 */
const accGroups=computed(()=>{const all=list("headwear");return ACC_GROUPS.map(([k,ids])=>({k,items:ids.map(id=>all.find(x=>x.id===id)).filter(Boolean)})).filter(g=>g.items.length)});
const accVal=computed(()=>s.value.headwear.length?nm("headwear"):t("thumb.none"));

/* 服装三大类：上装（单衣 / 外套）、下装、套装（套装 / 整体）。选了套装或整体，上装和下装就变灰失效，点里面的衣服会换回分体穿法 */
const wholeOn=computed(()=>!!currentSet(s.value)||s.value.mode==="onepiece");
/* 类别不做页签：全部列出来，每类之间一条淡淡的横线 */
const groupsOf=k=>{const all=list(k).filter(o=>k==='set'||!setOnly(o));return OUTFIT_GROUPS.map(G=>({k:G.k,items:all.filter(o=>o.group===G.k)})).filter(g=>g.items.length)};
const topVal=computed(()=>{const x=s.value;if(wholeOn.value)return t("panel.bySet");const w=x.top?nameOf("top",x.top):t("thumb.noWear");return x.outer?nameOf("outer",x.outer)+" + "+w:w});
const botVal=computed(()=>wholeOn.value?t("panel.bySet"):nameOf("bottom",s.value.bottom));
const setVal=computed(()=>{const x=s.value,st=currentSet(x);if(st)return nameOf("set",st.id);if(x.mode==="onepiece")return nameOf("onepiece",x.onepiece)+(x.outer?" + "+nameOf("outer",x.outer):"");return t("panel.noSet")});

/* 鞋子：时尚 / 运动 / 休闲 / 古风 / 其他，全部列出来，每类之间一条淡淡的横线 */
const shoeGroups=computed(()=>{const all=list("shoes");return SHOE_GROUPS.map(([k,ids])=>({k,items:ids.map(id=>all.find(x=>x.id===id)).filter(Boolean)})).filter(g=>g.items.length)});
/* 袜子先占位，还没出图；光脚时不写进提示词 */
const sockItems=computed(()=>list("socks"));
const shoesVal=computed(()=>nm("shoes"));
/* 左栏底部的颜色：跟着打开的大折叠走——发型给发色，饰品给饰品颜色，上装 / 下装 / 套装给对应衣服的颜色，鞋子给鞋子颜色 */
const dock=computed(()=>{
  const x=s.value,o=state.open,rows=[];
  if(o.hairbox)rows.push({key:"hc",hair:true,label:t("field.haircolor"),opts:HAIR_COLORS.map(h=>h.id).filter(c=>hcOk(x.hair,c)),cur:x.haircolor,set:c=>x.haircolor=c});
  else if(o.acc){
    x.headwear.forEach(id=>{const opts=colorOpts("headwear",id);if(opts.length>1)rows.push({key:"hw"+id,label:nameOf("headwear",id),opts,cur:x.hwc[id],set:c=>x.hwc[id]=c})});
  }
  /* 衣服、鞋子的颜色圆点去掉了（10-28 用户定：提示词只写名称，颜色留给用户自己写） */
  return rows;
});

const foldAll=()=>{state.open={}};

/* 泳装开关：打开前弹确认，关掉不用确认 */
const dlg=ref(null);
function toggleNsfw(){if(state.nsfw){state.nsfw=false;return}dlg.value.returnValue="";dlg.value.showModal()}
const onClose=()=>{if(dlg.value.returnValue==="yes")state.nsfw=true};
/* 饰品要换发型时的确认（不用浏览器自带的 confirm） */
const askDlg=ref(null);
watch(()=>state.ask,v=>{if(v&&askDlg.value&&!askDlg.value.open){askDlg.value.returnValue="";askDlg.value.showModal()}});
const onAsk=()=>{const a=state.ask;state.ask=null;if(askDlg.value.returnValue==="yes"&&a&&a.ok)a.ok()};
</script>

<template>
  <aside class="box left" :aria-label="t('panel.title')">
    <div class="lhead"><h2>{{t('panel.title')}}</h2><button class="mini" @click="foldAll">{{t('panel.foldAll')}}</button></div>
    <div class="scroll">
      <!-- 人物 -->
      <Fold big tone="person" k="person" :title="t('panel.person')" :val="genderLabel+' · '+nm('eth')+' · '+nm('age')">
        <template #lock><LockBtn k="person" :label="t('panel.person')"/></template>
        <span class="lbl">{{t('panel.gender')}}</span>
        <div class="pills">
          <button class="pill gpill" :aria-pressed="state.gmode==='female'" @click="setGender('female','f')"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="6" r="4"/><path d="M8 10v5M5.5 12.5h5"/></svg>{{t('panel.female')}}</button>
          <button class="pill gpill" :aria-pressed="state.gmode==='male'" @click="setGender('male','m')"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="9.5" r="4"/><path d="M9.5 6.5 14 2M10 2h4v4"/></svg>{{t('panel.male')}}</button>
        </div>
        <Fold v-for="k in personFields" :key="k" :k="'p_'+k" :title="t('field.'+k)+(MULTI.includes(k)?t('panel.multi'):'')" :val="nm(k)">
          <Pills :k="k"/>
          <!-- 人种限制：默认不给这个人种穿东亚传统服饰；解除后只写提示词，不出参考图 -->
        </Fold>
      </Fold>

      <!-- 发型 -->
      <Fold big tone="hair" k="hairbox" :title="t('panel.hair')" :val="hairVal">
        <template #lock><LockBtn k="hairbox" :label="t('panel.hair')"/></template>
        <section v-for="g in hairGroups" :key="g.k" class="sgroup">
          <span class="lbl">{{t('hgroup.'+g.k)}}</span>
          <Thumbs k="hair" :items="g.items"/>
        </section>
      </Fold>

      <!-- 饰品 -->
      <Fold big tone="hair" k="acc" :title="t('panel.acc')+t('panel.multi')" :val="accVal">
        <template #lock><LockBtn k="acc" :label="t('panel.acc')"/></template>
        <Thumbs k="headwear" :items="[{id:'none'}]"/>
        <section v-for="g in accGroups" :key="g.k" class="sgroup">
          <span class="lbl">{{t('agroup.'+g.k)}}</span>
          <Thumbs k="headwear" :items="g.items"/>
        </section>
      </Fold>

      <!-- 上装：单衣 / 外套 -->
      <Fold big tone="wear" k="wtop" :class="{dim:wholeOn}" :title="t('panel.top')" :val="topVal">
        <template #lock><LockBtn k="wear" :label="t('panel.wear')"/></template>
        <Tabs :opts="['top','outer'].map(v=>[v,t('wtab.'+v)])" :cur="state.tab.top" @pick="v=>state.tab.top=v"/>
        <Thumbs v-if="state.tab.top==='outer'" k="outer" :items="[{id:'none'}]"/>
        <section v-for="g in groupsOf(state.tab.top)" :key="state.tab.top+g.k" class="sgroup">
          <span class="lbl">{{t('group.'+g.k)}}</span>
          <Thumbs :k="state.tab.top" :items="g.items"/>
        </section>
      </Fold>

      <!-- 下装 -->
      <Fold big tone="wear" k="wbot" :class="{dim:wholeOn}" :title="t('panel.bottom')" :val="botVal">
        <template #lock><LockBtn k="wear" :label="t('panel.wear')"/></template>
        <section v-for="g in groupsOf('bottom')" :key="'b'+g.k" class="sgroup">
          <span class="lbl">{{t('group.'+g.k)}}</span>
          <Thumbs k="bottom" :items="g.items"/>
        </section>
      </Fold>

      <!-- 套装：套装 / 整体 -->
      <Fold big tone="wear" k="wset" :title="t('panel.set')" :val="setVal">
        <template #lock><LockBtn k="wear" :label="t('panel.wear')"/></template>
        <Tabs :opts="['set','onepiece'].map(v=>[v,t('wtab.'+v)])" :cur="state.tab.whole" @pick="v=>state.tab.whole=v"/>
        <section v-for="g in groupsOf(state.tab.whole)" :key="state.tab.whole+g.k" class="sgroup">
          <span class="lbl">{{t('group.'+g.k)}}</span>
          <Thumbs :k="state.tab.whole" :items="g.items"/>
        </section>
      </Fold>

      <!-- 鞋子 -->
      <Fold big tone="shoes" k="shoes" :title="t('panel.shoes')" :val="shoesVal">
        <template #lock><LockBtn k="shoes" :label="t('panel.shoes')"/></template>
        <section v-for="g in shoeGroups" :key="g.k" class="sgroup">
          <span class="lbl">{{t('stab.'+g.k)}}</span>
          <Thumbs k="shoes" :items="g.items"/>
        </section>
      </Fold>

      <!-- 袜子：单独一个大分类 -->
      <Fold big tone="shoes" k="socks" :title="t('panel.socks')" :val="nm('socks')">
        <template #lock><LockBtn k="shoes" :label="t('panel.shoes')"/></template>
        <Thumbs k="socks" :items="sockItems"/>
      </Fold>
    </div>
    <!-- 颜色：固定在左栏底部，用大圆点选 -->
    <div v-if="dock.length" class="dock">
      <ColorDots v-for="r in dock" :key="r.key" :hair="r.hair" :label="r.label" :opts="r.opts" :cur="r.cur" @pick="r.set"/>
    </div>
    <div class="lfoot">
      <button class="switch" role="switch" :aria-checked="state.cross" @click="state.cross=!state.cross"><span class="knob"></span><span>{{t('sw.cross')}}</span></button>
      <button class="switch" role="switch" :aria-checked="state.nsfw" @click="toggleNsfw"><span class="knob"></span><span>{{t('sw.nsfw')}}</span></button>
      <span class="rnd"><button class="btn" @click="resetSel">{{t('stage.reset')}}</button><button class="btn solid" @click="randomize">{{t('stage.random')}}</button></span>
    </div>
    <dialog ref="askDlg" class="confirm" @close="onAsk">
      <p>{{state.ask?.text}}</p>
      <form method="dialog" class="cbtns"><template v-if="!state.ask?.info"><button class="btn" value="no">{{t('sw.cancel')}}</button><button class="btn blue" value="yes">{{t('acc.ok')}}</button></template><button v-else class="btn blue" value="no">{{t('scene.ok')}}</button></form>
    </dialog>
    <!-- 打开泳装要先确认 -->
    <dialog ref="dlg" class="confirm" @close="onClose">
      <p>{{t('sw.confirm')}}</p>
      <form method="dialog" class="cbtns"><button class="btn" value="no">{{t('sw.cancel')}}</button><button class="btn blue" value="yes">{{t('sw.ok')}}</button></form>
    </dialog>
  </aside>
</template>
