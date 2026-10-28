<script setup>
/* 下载前的提醒（10-27 用户定）：场景图说明压缩和怎么重出；三视图轻轻提醒别做违规的事、与本站无关。
   勾「不用再提醒」就记在这台浏览器里，下次直接下载；不用浏览器原生 confirm */
import {ref} from "vue";
import {useI18n} from "vue-i18n";
const {t}=useI18n();
const dlg=ref(null),kind=ref("scene"),skip=ref(false);let job=null;
const KEY=k=>"xgw.dl.skip."+k;
const skipped=k=>{try{return localStorage.getItem(KEY(k))==="1"}catch(e){return false}};
function save(url,name){const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
function ask(k,url,name){
  if(skipped(k))return save(url,name);
  kind.value=k;skip.value=false;job={url,name};dlg.value.returnValue="";dlg.value.showModal();
}
function onClose(){
  if(dlg.value.returnValue!=="yes"||!job)return;
  if(skip.value){try{localStorage.setItem(KEY(kind.value),"1")}catch(e){}}
  save(job.url,job.name);job=null;
}
defineExpose({ask});
</script>
<template>
  <dialog ref="dlg" class="confirm dldlg" @close="onClose">
    <h3>{{t('dl.'+kind+'H')}}</h3>
    <p>{{t('dl.'+kind)}}</p>
    <label class="dlskip"><input type="checkbox" v-model="skip"> {{t('dl.skip')}}</label>
    <form method="dialog" class="cbtns"><button class="btn" value="no">{{t('sw.cancel')}}</button><button class="btn blue" value="yes">{{t('dl.ok')}}</button></form>
  </dialog>
</template>
