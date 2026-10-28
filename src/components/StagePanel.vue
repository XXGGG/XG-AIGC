<script setup>
/* 右边效果图：顶部一行是当前选择（按类别上色的标签）+ 参考图说明 + 缺失项；三视图在上、局部图一排在下；
   宽屏时提示词面板放在右边空白处（和大图并排），窄屏时从右边推出来；右下角只留一个开关按钮 */
import {computed,ref,reactive,watch,nextTick,onMounted,onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import {state,S,get,currentSet,getPart} from "../lib/store.js";
import {MODELS,IMG_MODEL} from "../data/models.js";
import {SHEETS} from "../lib/sheets.js";
import {sheetImg} from "../lib/images.js";
import {partsState,imgSrc} from "../lib/images.js";
import {hairColorName,nameOf} from "../lib/names.js";
import PromptDrawer from "./PromptDrawer.vue";

const {t,locale}=useI18n();
const P=computed(()=>partsState());
const active=computed(()=>IMG_MODEL);
/* 大图固定显示 Krea 2 的样例（网站图只用 Krea 2 出），换写法在提示词抽屉里 */
const sheetModels=MODELS.filter(m=>SHEETS[m.id]);
/* 三视图：穿的是某个套装原样才有；默认那套女生没出图前先用旧样例。自己搭的没有三视图，只摆局部图 */
const sheetSrc=computed(()=>{const r=sheetImg();if(r)return imgSrc(r.k);return null});
const sheetOn=computed(()=>state.showSheet&&!!sheetSrc.value);
const shown=computed(()=>[sheetModels[0]]);

const editing=computed(()=>{
  const g=state.gmode==="custom"?(state.custom||t("panel.custom")):t(state.g==="f"?"panel.female":"panel.male");
  return g+" · "+nameOf("age",S().age);
});
const wearName=computed(()=>{const s=S(),st=currentSet(s);if(st)return nameOf("set",st.id);const w=s.mode==="onepiece"?nameOf("onepiece",s.onepiece):nameOf("top",s.top)+" + "+nameOf("bottom",s.bottom);return s.outer?nameOf("outer",s.outer)+" + "+w:w});
/* 顶部标签：发型（或头饰）· 发色 / 服装 / 鞋子，颜色和左栏、提示词里的高亮一致 */
/* 局部图下面的彩色标签：一行「单衣：xxx」，颜色和左栏、提示词高亮一致（10-26 用户定，顶部标签去掉） */
const TONE={person:"person",head:"hair",headwear:"hair",set:"wear",outer:"wear",top:"wear",bottom:"wear",onepiece:"wear",shoes:"shoes",socks:"shoes"};
const sep=computed(()=>/^(zh|ja)/.test(locale.value)?"：":": ");
const chips=computed(()=>{
  const s=S(),head=nameOf("hair",s.hair);
  return [["hair",head+" · "+hairColorName(s.haircolor)],["wear",wearName.value],["shoes",nameOf("shoes",s.shoes)]];
});

function zoomSheet(m){
  const src=sheetSrc.value;
  state.zoom={title:t("stage.sheet",{m:m.name})+" · "+(src?t("stage.sample"):t("stage.pending")),srcs:src?[src]:[],sheet:true,ptab:"sheet"};
}
/* 摆放：大图和局部图都用绝对定位，位置由下面算出来，变化时 CSS 过渡（不会闪）。
   两种摆法，按舞台可用宽高各算一遍大图能有多大，取大的那种：
   - 沉底：局部图一排在大图下面；
   - 竖排：局部图一列在大图左边（收起提示词后横向空间多，通常选这个）。 */
const sb=ref(null);
const L=reactive({mode:"bottom",sx:0,sy:0,sw:0,sh:0,t:120,cap:38,tiles:[],anim:false});
const PAD={l:24,r:24,t:8,b:16},GAP=16,TG=12;
let animUntil=0;
function layout(){
  const el=sb.value;if(!el)return;
  const W=el.clientWidth-PAD.l-PAD.r,H=el.clientHeight-PAD.t-PAD.b,n=P.value.tiles.length||1;
  if(W<=0||H<=0)return;
  const cap=window.innerWidth<=900?0:38;
  /* 关掉三视图：只摆局部图，按行分组（人物+发型 / 饰品 / 穿搭+袜子+鞋子），每组另起一行；试 1..n 列，取格子最大的那种 */
  if(!sheetOn.value){
    const groups=[];P.value.tiles.forEach((tl,i)=>{const r=tl.row||1;(groups[r]??=[]).push(i)});
    const gs=groups.filter(Boolean),maxLen=Math.max(1,...gs.map(g=>g.length));
    let best={t:0,cols:1};
    for(let cols=1;cols<=maxLen;cols++){
      const rows=gs.reduce((a,g)=>a+Math.ceil(g.length/cols),0);
      const t=Math.floor(Math.min(420,(W-(cols-1)*TG)/cols,(H-rows*cap-(rows-1)*TG)/rows));
      if(t>best.t)best={t,cols};
    }
    const {t,cols}=best,rows=gs.reduce((a,g)=>a+Math.ceil(g.length/cols),0),bw=cols*t+(cols-1)*TG,bh=rows*(t+cap)+(rows-1)*TG;
    const x0=PAD.l+Math.max(0,Math.round((W-bw)/2)),y0=PAD.t+Math.max(0,Math.round((H-bh)/2));
    const tiles=[];let r=0;
    gs.forEach(g=>{g.forEach((idx,j)=>{tiles[idx]={x:x0+(j%cols)*(t+TG),y:y0+(r+Math.floor(j/cols))*(t+cap+TG)}});r+=Math.ceil(g.length/cols)});
    L.anim=L.mode!=="grid"||performance.now()<animUntil;
    Object.assign(L,{mode:"grid",t,cap,tiles});
    return;
  }
  /* 沉底：局部图边长约为高度的 17%，一排要放得下 */
  const tB=Math.max(40,Math.min(148,Math.round(H*.17),Math.floor((W-(n-1)*TG)/n)));
  const wB=Math.max(0,Math.min(W,(H-tB-cap-GAP)*1.5));
  /* 竖排：一列 n 张要放得下高度 */
  const tS=Math.max(40,Math.min(148,Math.floor((H-(n-1)*TG)/n-cap)));
  const wS=Math.max(0,Math.min(W-tS-GAP,H*1.5));
  /* 差不多大时保持现状，免得窗口拖动时来回跳 */
  const side=L.mode==="side"?wS>=wB-12:L.mode==="grid"?wS>wB:wS>wB+12;
  const mode=side?"side":"bottom",t=side?tS:tB,sw=Math.round(side?wS:wB),sh=Math.round(sw/1.5);
  const blockW=side?t+GAP+sw:Math.max(sw,n*t+(n-1)*TG);
  const x0=PAD.l+Math.max(0,Math.round((W-blockW)/2));
  const tiles=[];
  for(let i=0;i<n;i++)tiles.push(side?{x:x0,y:PAD.t+i*(t+cap+TG)}:{x:x0+i*(t+TG),y:PAD.t+sh+GAP});
  L.anim=mode!==L.mode||performance.now()<animUntil;
  Object.assign(L,{mode,t,cap,sw,sh,sx:side?x0+t+GAP:x0,sy:PAD.t,tiles});
}
let ro;
onMounted(()=>{ro=new ResizeObserver(()=>layout());if(sb.value)ro.observe(sb.value);layout()});
onBeforeUnmount(()=>ro&&ro.disconnect());
watch(()=>P.value.tiles.map(x=>(x.id||x.k)+x.row).join(),()=>nextTick(layout));
/* 展开 / 收起提示词时舞台宽度会一路变化，这段时间里位置都带过渡 */
watch(()=>state.drawer,()=>{animUntil=performance.now()+600});
watch(sheetOn,()=>{animUntil=performance.now()+600;layout()});
const tileStyle=i=>{const p=L.tiles[i]||{x:0,y:0};return {transform:`translate(${p.x}px,${p.y}px)`,width:L.t+"px"}};

/* 局部图格子 → 抽屉里对应那段提示词 */
const PTAB={socks:()=>"socks",person:()=>"person",set:()=>"set",head:()=>"hair",headwear:tl=>"headwear:"+(tl?.hw||S().headwear[0]),outer:()=>"outer",top:()=>"top",bottom:()=>"bottom",onepiece:()=>"onepiece",shoes:()=>"shoes"};
function zoomPart(tile){
  const imgs=tile.k==="headwear"?tile.all:(tile.img?[tile.img]:[]);
  state.zoom={title:t("part."+tile.k)+" · "+tile.val+" · "+(imgs.length?t("miss.ref"):t("part.pending")),srcs:imgs.map(x=>imgSrc(x.k)),sheet:false,ptab:PTAB[tile.k]?.(tile)};
}
</script>

<template>
  <main :class="['box','stage',{withp:state.drawer}]" :aria-label="t('stage.sheet',{m:active.name})">
    <div class="shead">
      <b>{{editing}}</b>
      <!-- 参考图说明 + 缺失项：选了但图里看不到的 -->
      <div class="miss" aria-live="polite" :title="P.miss.length?t('miss.tip'):''">
        <b class="refnote" tabindex="0" :title="t('zoom.compress')">{{t('miss.ref')}} ⓘ</b>
        <template v-if="P.miss.length">
          <span class="ml">{{t('miss.label')}}</span>
          <span v-for="(m,i) in P.miss" :key="i" class="mi">{{t('miss.'+m[0],{v:m[1]})}}</span>
        </template>
        <span v-if="P.pend.length" class="pd">{{t('miss.pend',{v:P.pend.map(k=>t('part.'+k)).join('、')})}}</span>
      </div>
      <!-- 右上角：先关掉三视图，只看局部图 -->
      <button v-if="sheetSrc" class="sheettg" :aria-pressed="!state.showSheet" :title="t(state.showSheet?'stage.sheetOff':'stage.sheetOn')" :aria-label="t(state.showSheet?'stage.sheetOff':'stage.sheetOn')" @click="state.showSheet=!state.showSheet">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M9 5v14M15 5v14"/><path v-if="state.showSheet" d="M4 20 20 4"/></svg>
        <span>{{t(state.showSheet?'stage.sheetOff':'stage.sheetOn')}}</span>
      </button>
    </div>

    <div ref="sb" :class="['sbody',L.mode,{anim:L.anim,nocap:!L.cap}]" :aria-label="t('part.title')">
      <template v-for="m in shown" :key="m.id">
        <button :class="['pic',{off:!sheetOn}]" :tabindex="sheetOn?0:-1" :aria-hidden="!sheetOn" :style="{transform:`translate(${L.sx}px,${L.sy}px)`,width:L.sw+'px',height:L.sh+'px'}" :aria-label="t('stage.zoom',{x:t('stage.sheet',{m:m.name})})" @click="zoomSheet(m)">
          <template v-if="sheetSrc"><img :src="sheetSrc" :alt="t('stage.sheetAlt',{m:m.name})"><em class="bdg">{{m.name}} · {{t('part.ai')}}</em></template>
          <div v-else class="slot3"><span>{{t('stage.portrait')}}</span><span>{{t('stage.front')}}</span><span>{{t('stage.back')}}</span><em>{{t('stage.pending')}}</em></div>
        </button>
      </template>
      <button v-for="(tile,i) in P.tiles" :key="tile.id||tile.k" class="part" :style="tileStyle(i)" :title="t('part.'+tile.k)+' · '+tile.val" :aria-label="t('stage.zoom',{x:t('part.'+tile.k)})" @click="zoomPart(tile)">
        <i v-if="tile.img" class="has"><img :src="imgSrc(tile.img.k)" :alt="t('part.'+tile.k)+'：'+tile.val" decoding="async"><em class="bdg">{{t('part.ai')}}</em></i>
        <i v-else-if="tile.text" class="txt">{{tile.text}}</i>
        <i v-else><em class="pz">{{t('part.'+tile.k)}}</em>{{t('part.pending')}}</i>
        <span :class="'ptag tone-'+TONE[tile.k]">{{t('part.'+tile.k)}}{{sep}}{{tile.val}}</span>
      </button>
    </div>

    <PromptDrawer :tiles="P.tiles"/>
    <!-- 收起后：右下角一颗浮动圆球，点了展开提示词 -->
    <button :class="['pball',{hide:state.drawer}]" :title="t('stage.show')" :aria-label="t('stage.show')" aria-controls="drawer" :aria-expanded="state.drawer" :tabindex="state.drawer?-1:0" @click="state.drawer=true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6h14M5 11h14M5 16h9"/><path d="m17 15 2 2 2-2" /></svg>
    </button>
  </main>
</template>
