<script setup>
import {watch,onMounted,onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import {state,S,sanitize} from "./lib/store.js";
import {restore,autosave} from "./lib/persist.js";
restore();autosave();
import TopBar from "./components/TopBar.vue";
import SidePanel from "./components/SidePanel.vue";
import StagePanel from "./components/StagePanel.vue";
import ZoomDialog from "./components/ZoomDialog.vue";
import AboutPage from "./components/AboutPage.vue";
import CreatorsPage from "./components/CreatorsPage.vue";
import LibSplit from "./components/LibSplit.vue";
import ScenePage from "./components/ScenePage.vue";
import CasePage from "./components/CasePage.vue";

const {t,locale}=useI18n();
/* 性别、开关、年龄变了以后，把不再可选的东西换掉 */
watch(()=>[state.g,state.cross,state.nsfw,S().age,S().eth],()=>sanitize());
watch(locale,l=>{document.documentElement.lang=l;document.title=t("app.title")},{immediate:true});
const onKey=e=>{if(e.key!=="Escape")return;if(state.zoom)state.zoom=null;else if(state.drawer)state.drawer=false};
onMounted(()=>document.addEventListener("keydown",onKey));
onBeforeUnmount(()=>document.removeEventListener("keydown",onKey));
</script>
<template>
  <div class="app">
    <TopBar/>
    <AboutPage v-if="state.page==='about'"/>
    <CreatorsPage v-else-if="state.page==='creators'"/>
    <ScenePage v-else-if="state.page==='scene'"/>
    <CasePage v-else-if="state.page==='cases'"/>
    <LibSplit v-else-if="['sheet','prompt','camera','filter','photo'].includes(state.page)"/>
    <div v-else class="main"><SidePanel/><StagePanel/></div>
  </div>
  <ZoomDialog/>
</template>
