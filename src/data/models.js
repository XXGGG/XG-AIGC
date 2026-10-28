/* 出图模型。dir=图片目录前缀；tiles=网站有没有它出的局部图；sheet=有没有它出的三视图样例；fmt=提示词写法（见 lib/prompt.js）
   10-26 定：网站上的图只用 Krea 2 出（官方 Turbo + 中文）；Z-Image、Qwen 2.1 只给提示词（Qwen 2.1 是研究许可，不拿它的图公开）；
   GPT-image2 用各平台免费额度出，只给三视图提示词 */
export const MODELS=[
  {id:"krea2",name:"Krea 2",dir:"krea2",tiles:true,sheet:true,fmt:"krea",local:true},
  {id:"zimage",name:"Z-Image",dir:"zimage",tiles:false,sheet:false,fmt:"zimage",local:true},
  {id:"qwen21",name:"Qwen 2.1",dir:"qwen21",tiles:false,sheet:false,fmt:"qwen",local:true},
  {id:"gpt",name:"GPT-image2",dir:"gpt",tiles:false,sheet:false,fmt:"long",local:false}
];
/* 网站上的图都由它生成 */
export const IMG_MODEL=MODELS.find(m=>m.tiles);
