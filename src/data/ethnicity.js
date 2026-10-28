/* 人种 / 长相（10-26 去掉东南亚、南亚；「白人」「黑人」改成「欧美」「非洲裔」）：[id, 名称, 提示词片段, 动画标签]。局部图目前都是东亚默认脸，选别的会进缺失项 */
export const ETHNICITY=[
  /* 10-27 用户定：暂时只做这四个 + 混血。人种特征写具体（眉骨、眼窝、鼻梁、轮廓），只写「欧洲人长相」会被后面的五官盖掉 */
  ["east_asian","东亚 · 中国","中国人长相，典型的东亚面孔：面部轮廓柔和平整，眉骨不高，眼窝浅，鼻梁中等高度","east asian"],
  ["japanese","日本","日本人长相，典型的日本面孔：脸偏小，五官清淡柔和，眉眼间距稍宽，鼻梁细而直，下巴小巧","japanese"],
  ["korean","韩国","韩国人长相，典型的韩国面孔：脸型偏窄，额头饱满，下颌线干净利落，五官精致清秀","korean"],
  ["white","欧美","欧洲白人长相，典型的欧美高加索面孔：眉骨较高，眼窝深，双眼皮宽而深，鼻梁高挺、鼻子窄长，面部轮廓立体，下颌线清晰","european, caucasian"],
  ["mixed","混血","东西方混血长相（一半欧洲白人、一半东亚血统）：有欧美人的立体五官，眉骨和鼻梁较高、眼窝较深，脸型又带着东亚人的柔和","eurasian mixed race"]
];
/* 人物段用的长相：分男女写满骨相（10-27 头像实测：男欧美、混血只写一句会被画回东亚脸；中日韩男生三张几乎一样）。
   最后带一句英文，Krea 2 认得；没写的退回上面 ETHNICITY 的那句 */
export const ETH_FACE={
  east_asian:{
    f:"中国人长相，典型的中国北方汉族女生面孔：鹅蛋脸偏宽，颧骨略宽，面部轮廓柔和平整，眉骨不高，眼窝浅，单眼皮或很窄的内双，眼睛不大，鼻梁中等高度、鼻翼略宽，黑色眼睛，大气端庄（Chinese woman, Han Chinese, East Asian）",
    m:"中国人长相，典型的中国北方汉族男生面孔：面部宽而平整，颧骨略宽，眉骨不高，眼窝浅，眼睛细长、单眼皮或内双，鼻梁中等高度、鼻翼略宽，下颌方正（Chinese man, East Asian）"},
  japanese:{
    f:"日本人长相，典型的日本女生面孔：脸小偏圆、两颊饱满，五官清淡柔和，眉毛细而平、颜色偏淡，眼睛圆而温和、略下垂，鼻子小而塌、鼻头圆，嘴巴小，日系自然淡妆感（Japanese woman, Japanese face）",
    m:"日本人长相，典型的日本男生面孔：脸型修长偏窄，五官清淡，眉毛细而平，眼睛细长、单眼皮，鼻梁细直、鼻头小，下巴尖而小，气质斯文安静（Japanese man）"},
  korean:{
    f:"韩国人长相，典型的韩国女生面孔：脸型窄而长、下巴尖，颧骨略高，额头饱满圆润，一字平直粗眉，眼睛细长、内双、卧蚕明显，鼻梁高而直，皮肤冷白透亮有水光感，五官精致清秀（Korean woman, Korean face）",
    m:"韩国人长相，典型的韩国男生面孔：脸型窄长，颧骨略高，额头饱满，一字平直浓眉，眼睛细长、内双，鼻梁高而直，下颌线干净利落，皮肤冷白干净（Korean man）"},
  white:{
    f:"欧洲白人长相，典型的欧美高加索女性面孔：眉骨较高，眼窝深，双眼皮宽而深，浅色眼睛，鼻梁高挺、鼻子窄长，面部轮廓立体，皮肤白里透粉（Caucasian European woman）",
    m:"欧洲白人男性长相，典型的欧美高加索男性面孔，不是亚洲人：眉骨高而突出，眼窝深，深双眼皮，浅灰蓝色眼睛，鼻梁高而窄、从眉间就开始隆起，颧骨窄，方下颌，下巴有一点下巴沟，脸上有浅浅的胡茬，浅棕色眉毛，皮肤白里透粉（Caucasian European man, white male）"},
  mixed:{
    f:"欧亚混血女生长相，一半欧洲白人、一半东亚血统，西方特征占一大半，一看就不是亚洲人：眉骨高、眼窝深，宽而深的欧式双眼皮，浅灰绿色眼睛，鼻梁高而直、从眉间就开始隆起，颧骨立体，鼻梁和两颊有淡淡的雀斑；只有下巴和脸型带一点东方的柔和，皮肤白里透一点暖调（mixed Eurasian woman, half Caucasian European half East Asian, mostly Western features, light eyes, freckles）",
    m:"欧亚混血儿长相，一半欧洲白人、一半东亚血统，西方骨相很明显，一看就不是纯亚洲人：高而直的鼻梁，眉骨高、眼窝深，宽而深的欧式双眼皮，灰绿色或浅棕色眼睛，方下颌，轮廓立体，脸上有浅浅的胡茬；只有颧骨和脸型带一点东方感（mixed Eurasian man, half Caucasian European half East Asian, strong Western bone structure）"}
};
export const ethText=(id,g)=>(ETH_FACE[id]&&ETH_FACE[id][g])||(ETHNICITY.find(r=>r[0]===id)||[])[2]||"";
/* 选人种时顺手换成这个人种常见的五官、肤色和发色（人物头像也照这套出，同一人种各年龄像同一个人） */
export const ETH_LOOK={
  east_asian:{f:{face:"oval",eyes:"narrow",iris:"dbrown",brows:"flat",nose:"fine",skin:"fair",haircolor:"black"},m:{face:"square",eyes:"narrow",iris:"black",brows:"sword",nose:"broad",skin:"warm",haircolor:"black"}},
  japanese:{f:{face:"round",eyes:"droop",iris:"dbrown",brows:"thin",nose:"fine",skin:"fair",haircolor:"brown"},m:{face:"melon",eyes:"mono",iris:"dbrown",brows:"thin",nose:"fine",skin:"warm",haircolor:"black"}},
  korean:{f:{face:"melon",eyes:"fox",iris:"black",brows:"flat",nose:"high",skin:"pale",haircolor:"black"},m:{face:"long",eyes:"narrow",iris:"black",brows:"flat",nose:"high",skin:"pale",haircolor:"black"}},
  white:{f:{face:"heart",eyes:"round",iris:"blue",brows:"arch",nose:"high",skin:"fair",haircolor:"blonde"},m:{face:"square",eyes:"sharp",iris:"grey",brows:"wild",nose:"aquiline",skin:"fair",haircolor:"brown"}},
  mixed:{f:{face:"heart",eyes:"round",iris:"green",brows:"arch",nose:"high",skin:"fair",haircolor:"brown"},m:{face:"square",eyes:"round",iris:"green",brows:"wild",nose:"high",skin:"wheat",haircolor:"brown"}}
};
/* 人种限制：默认不给这些人种穿下面的东亚传统服饰和古风发型（不出参考图），用户可以在人种下面「解除限制」，解除后照样写进提示词 */
export const ETH_LIMIT={black:{groups:["ancient"],shoes:["xiuhua","boot_cloth","kungfu","chaoxue","geta"],ids:["kimono_furisode","hanbok_dress","qipao_silk","xiuhe_top","xiuhe_skirt","jacket_miao","skirt_miao","top_dai","skirt_tube_dai","chuba_tibetan","deel_mongol","zhongshan_jacket","jacket_kungfu","pants_kungfu","aodai_full","ruqun"]}};
