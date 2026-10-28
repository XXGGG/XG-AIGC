// 生成 20 词测试里的 5 张三视图提示词（女性、东亚），用网站自己的提示词逻辑
import {createServer} from "vite";
const vite=await createServer({server:{middlewareMode:true},appType:"custom",logLevel:"error"});
const st=await vite.ssrLoadModule("/src/lib/store.js");
const pr=await vite.ssrLoadModule("/src/lib/prompt.js");
const {state,S,applySet,freshSel}=st;
const CASES=[
  {id:"casual",set:"tee_jeans",hair:"f_highpony",hc:"brown",hw:[],shoes:"sneaker"},
  {id:"office",set:"skirt_suit",hair:"f_bob",hc:"black",hw:[],shoes:"heel"},
  {id:"jk",set:"jk",hair:"f_straight",hc:"black",hw:[],shoes:"loafer"},
  {id:"ruqun",set:"ruqun",hair:"f_lingyun",hc:"black",hw:["buyao"],shoes:"xiuhua"},
  {id:"gown",set:"gown",hair:"f_hkwave",hc:"black",hw:[],shoes:"heel"},
];
const out=[];
for(const c of CASES){
  state.g="f";state.sel.f=freshSel("f");const s=S();
  applySet(s,c.set);s.hair=c.hair;s.haircolor=c.hc;s.headwear=c.hw;s.hwc=Object.fromEntries(c.hw.map(x=>[x,"none"]));s.shoes=c.shoes;s.sc="none";
  out.push({id:c.id,set:c.set,zimage:pr.buildPrompt("zimage"),qwen:pr.buildPrompt("qwen"),krea_tags:pr.buildPrompt("krea")});
}
process.stdout.write(JSON.stringify(out,null,1));
await vite.close();
