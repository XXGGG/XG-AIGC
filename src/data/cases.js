/* 案例：做过的 AI 视频，只放成片里实际用上的生成片段（未剪辑），只能在线看。
   素材在 public/cases/<作品>/<片段>.mp4 + .jpg，参考图在 public/cases/<作品>/ref/<key>.webp */
import {CLIP_PROMPTS,XIAOLAN_SHEET,FLY_GRID} from "./casePrompts.js";
/* 参考图：名字 + 有提示词的附上提示词（可在右栏切过去复制） */
export const CASE_REFS={
  xiaolan:{name:{"zh-CN":"小岚三视图",en:"Xiaolan turnaround"},prompt:XIAOLAN_SHEET},
  fly_scene:{name:{"zh-CN":"场景-御剑飞行",en:"Scene: night city from above"}},
  fly_grid:{name:{"zh-CN":"六宫格分镜",en:"6-panel storyboard"},prompt:FLY_GRID},
  sword:{name:{"zh-CN":"斩魔剑",en:"Sword"}},
  fish1:{name:{"zh-CN":"小岚-垂钓-打瞌睡",en:"Xiaolan fishing, dozing"}},
  fish2:{name:{"zh-CN":"小岚-垂钓-起身",en:"Xiaolan fishing, standing"}}
};
const SD="即梦 · Seedance 2.5";
const c=(id,zh,en,res,sec,ratio,refs)=>({id,name:{"zh-CN":zh,en},model:SD,res,sec,ratio,refs,prompt:CLIP_PROMPTS[id]});
/* 顺序照剪映时间线；links 是成片在各平台的地址 */
export const CASE_PLAT=["bilibili","douyin","xhs","youtube"];
export const CASES=[
  {id:"sillybeauty",title:{"zh-CN":"《笨蛋美女~》",en:"Clumsy Cutie~"},
  links:{bilibili:"https://www.bilibili.com/video/BV1PnnK61EGB",douyin:"https://v.douyin.com/mungFGbp0-E/",xhs:"https://xhslink.cn/o/5cTo2E0Fur3",youtube:"https://www.youtube.com/shorts/oDIOom0B7r0"},clips:[
    c("fly2","御剑自拍","Selfie on a flying sword","720×1280",8,"9:16",["xiaolan","fly_scene","fly_grid","sword"]),
    c("konbini","便利店吃关东煮","Oden by the window","720×1280",5,"9:16",["xiaolan"]),
    c("doze","钓鱼打瞌睡","Dozing off while fishing","720×1280",5,"9:16",["fish1"]),
    c("revolving_door","商场旋转门","Revolving door","720×1280",10,"9:16",["xiaolan"]),
    c("fishing","钓鱼空军","Nothing on the line","720×1280",8,"9:16",["fish1","fish2"]),
    c("cat","空调外机救猫","Saving a kitten","480×854",8,"9:16",["xiaolan","sword"]),
    c("highway","高速公路飞行","Overtaking on the highway","480×854",8,"9:16",["xiaolan"]),
    c("bump","御剑撞限高架","Hitting the height barrier","1112×834",7,"4:3",["xiaolan"])
  ]}
];
