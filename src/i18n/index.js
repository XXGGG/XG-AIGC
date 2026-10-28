import {createI18n} from "vue-i18n";
import zhCN from "./zh-CN.js";import zhTW from "./zh-TW.js";import en from "./en.js";import ja from "./ja.js";import ko from "./ko.js";

export const LOCALES=[["zh-CN","简体中文"],["zh-TW","繁體中文"],["en","English"],["ja","日本語"],["ko","한국어"]];
/* 先看上次选的，再看浏览器语言 */
function pick(){
  try{const s=localStorage.getItem("xgw.lang");if(s&&LOCALES.some(l=>l[0]===s))return s}catch(e){}
  const n=(navigator.language||"zh-CN").toLowerCase();
  if(n.startsWith("zh"))return /tw|hk|mo|hant/.test(n)?"zh-TW":"zh-CN";
  if(n.startsWith("ja"))return "ja";if(n.startsWith("ko"))return "ko";if(n.startsWith("en"))return "en";
  return "zh-CN";
}
export const i18n=createI18n({legacy:false,locale:pick(),fallbackLocale:"zh-CN",messages:{"zh-CN":zhCN,"zh-TW":zhTW,en,ja,ko}});
export function setLocale(l){i18n.global.locale.value=l;document.documentElement.lang=l;try{localStorage.setItem("xgw.lang",l)}catch(e){}}
