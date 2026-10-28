/* 繁体中文条目名：用 OpenCC（简→台湾正体，含常用词）从简体自动转，人工改过的写在 zh-TW.fix.json 里优先 */
const fs=require("fs"),path=require("path");
const OpenCC=require("opencc-js");
const conv=OpenCC.Converter({from:"cn",to:"twp"});
const src=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const out={};for(const [k,v] of Object.entries(src))out[k]=conv(v);
const fixF=path.join(__dirname,"../src/i18n/items/zh-TW.fix.json");
if(fs.existsSync(fixF))Object.assign(out,JSON.parse(fs.readFileSync(fixF,"utf8")));
fs.writeFileSync(path.join(__dirname,"../src/i18n/items/zh-TW.json"),JSON.stringify(out,null,1));
console.log(Object.keys(out).length,"zh-TW names");
