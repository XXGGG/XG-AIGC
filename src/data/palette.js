/* 由 tools/import-legacy.cjs 从 v0.6 数据转来；之后直接改这里 */
/* 颜色词表；hair=5 个常用发色；headwear/shoes=每件能选的颜色，c 第一个是默认，d=none 表示提示词不写颜色；deftxt=不写颜色时用的句子 */
export const VOC={
 "cyan": {"zh":"青色","en":"cyan","hex":"#3BB3B0"},
 "red": {
  "zh": "红色",
  "en": "red",
  "hex": "#C4392F"
 },
 "orange": {
  "zh": "橙色",
  "en": "orange",
  "hex": "#E07A2E"
 },
 "yellow": {
  "zh": "黄色",
  "en": "yellow",
  "hex": "#E6C04A"
 },
 "green": {
  "zh": "绿色",
  "en": "green",
  "hex": "#3F8A55"
 },
 "blue": {
  "zh": "蓝色",
  "en": "blue",
  "hex": "#3D6DB3"
 },
 "purple": {
  "zh": "紫色",
  "en": "purple",
  "hex": "#7A4F9E"
 },
 "black": {
  "zh": "黑色",
  "en": "black",
  "hex": "#26231F"
 },
 "white": {
  "zh": "白色",
  "en": "white",
  "hex": "#F4F2EC"
 },
 "pink": {
  "zh": "粉色",
  "en": "pink",
  "hex": "#E8A6B4"
 },
 "navy": {
  "zh": "藏青色",
  "en": "navy",
  "hex": "#2C3550"
 },
 "grey": {
  "zh": "灰色",
  "en": "grey",
  "hex": "#8C8C90"
 },
 "beige": {
  "zh": "米色",
  "en": "beige",
  "hex": "#E3D5BC"
 },
 "khaki": {
  "zh": "卡其色",
  "en": "khaki",
  "hex": "#BFA678"
 },
 "brown": {
  "zh": "棕色",
  "en": "brown",
  "hex": "#6B4430"
 },
 "olive": {
  "zh": "军绿色",
  "en": "olive",
  "hex": "#5F6240"
 },
 "teal": {
  "zh": "深青蓝色",
  "en": "deep teal blue",
  "hex": "#2D5566"
 },
 "gold": {
  "zh": "金色",
  "en": "gold",
  "hex": "#C9A23E"
 },
 "silver": {
  "zh": "银色",
  "en": "silver",
  "hex": "#C3C5CA"
 },
 "lightblue": {
  "zh": "浅蓝色",
  "en": "light blue",
  "hex": "#A9C3DE"
 },
 "darkgreen": {
  "zh": "墨绿色",
  "en": "dark green",
  "hex": "#2F4A3A"
 },
 "camel": {
  "zh": "驼色",
  "en": "camel",
  "hex": "#C9A579"
 }
};
export const HAIR_COLORS=[
 {
  "id": "black",
  "label": "黑",
  "zh": "黑色",
  "en": "black",
  "hex": "#1E1C1A"
 },
 {
  "id": "brown",
  "label": "棕",
  "zh": "棕色",
  "en": "brown",
  "hex": "#6B4430"
 },
 {
  "id": "white",
  "label": "白",
  "zh": "银白色",
  "en": "white",
  "hex": "#CFCFD2"
 },
 {
  "id": "red",
  "label": "红",
  "zh": "酒红色",
  "en": "red",
  "hex": "#6E2230"
 },
 {
  "id": "blonde",
  "label": "金",
  "zh": "金色",
  "en": "blonde",
  "hex": "#D9C08C"
 }
];
export const HEADWEAR_COLORS={"buyao":{"c":["gold","silver"],"d":"gold"},"zan":{"c":["silver","gold"],"d":"none"},"huadian":{"c":["pink","red","white"],"d":"none"},"guan_f":{"c":["gold","silver"],"d":"gold"},"fasuo":{"c":["gold","silver"],"d":"gold"},"ribbon_f":{"c":["red","white","pink","blue"],"d":"red"},"flower":{"c":["red","pink","white","yellow"],"d":"red"},"yuguan":{"c":["gold","silver"],"d":"none"},"jin":{"c":["black","teal","white"],"d":"black"},"futou":{"c":[],"d":"none"},"mo_e":{"c":["red","black","white"],"d":"red"},"clip":{"c":["gold","silver","black"],"d":"gold"},"headband":{"c":["gold","black","white","pink"],"d":"gold"},"scrunchie":{"c":["beige","black","white","pink","red","blue"],"d":"beige"},"bow":{"c":["white","black","red","pink"],"d":"white"},"beret":{"c":["black","red","beige","brown"],"d":"black"},"cap":{"c":["black","white","navy","red","beige"],"d":"black"},"beanie":{"c":["grey","black","beige","red","white","navy"],"d":"grey"},"bucket":{"c":["beige","black","white","olive"],"d":"beige"},"fedora":{"c":["black","grey","brown","beige"],"d":"black"},"glasses":{"c":["black","gold","silver"],"d":"black"},"earring":{"c":["gold","silver"],"d":"gold"}};
export const SHOES_COLORS={"sneaker_dad":{"c":["white", "beige", "black"],"d":"none"},"running":{"c":["white", "black", "blue", "pink"],"d":"none"},"court":{"c":["white", "black"],"d":"none"},"slipon":{"c":["white", "black", "navy"],"d":"none"},"boat":{"c":["brown", "navy"],"d":"none"},"espadrille":{"c":["beige", "navy", "white"],"d":"none"},"slingback":{"c":["black", "beige", "white"],"d":"none"},"kitten":{"c":["black", "beige", "red"],"d":"none"},"boot_knee_flat":{"c":["black", "brown"],"d":"none"},"monk":{"c":["black", "brown"],"d":"none"},"clog":{"c":["white", "black", "green", "pink"],"d":"none"},"flipflop":{"c":["black", "white", "blue"],"d":"none"},"ankle_heel":{"c":["black", "brown", "beige"],"d":"none"},"xiuhua":{"c":["red","pink","white"],"d":"none"},"cloth":{"c":["black","white"],"d":"none"},"boot_cloth":{"c":["black","brown"],"d":"none"},"suede":{"c":["brown","khaki","black"],"d":"none"},"martin":{"c":["black","brown","red"],"d":"none"},"riding":{"c":["black","brown"],"d":"none"},"sneaker":{"c":["white","black","grey"],"d":"none"},"canvas":{"c":["black","white","red"],"d":"none"},"loafer":{"c":["black","brown"],"d":"none"},"oxford":{"c":["black","brown"],"d":"none"},"heel":{"c":["black","red","white"],"d":"none"},"mary":{"c":["black","white","red"],"d":"none"},"sandal":{"c":["brown","black"],"d":"none"},"barefoot":{"c":[],"d":"none"},"chelsea":{"c":["black","brown"],"d":"none"},"block_boot":{"c":["black","brown","beige"],"d":"none"},"platform":{"c":["black","white"],"d":"none"},"ballet":{"c":["black","pink","beige"],"d":"none"},"derby":{"c":["black","brown"],"d":"none"},"hiking":{"c":["brown","grey","black"],"d":"none"},"bball":{"c":["white","black","red"],"d":"none"},"cowboy":{"c":["brown","black"],"d":"none"},"snow":{"c":["khaki","brown","black"],"d":"none"},"thigh":{"c":["black","brown"],"d":"none"},"mule":{"c":["black","white","beige"],"d":"none"},"kungfu":{"c":[],"d":"none"},"chaoxue":{"c":[],"d":"none"},"geta":{"c":["black"],"d":"none"},"shell_toe":{"c":["white","black"],"d":"none"},"canvas_low":{"c":["white","black","red","navy"],"d":"none"},"heel_sandal":{"c":["black","beige","red","silver"],"d":"none"},"slippers":{"c":["white","black","pink","blue"],"d":"none"},"rainboots":{"c":["yellow","black","red","navy"],"d":"none"}};
export const DEFTXT={
 "shoes.xiuhua": "缎面绣花鞋，鞋面用彩色丝线绣着一枝盛开的牡丹和几片绿叶，花朵占满鞋头到鞋背，鞋头微微上翘，平底",
 "shoes.cloth": "平底布鞋，鞋面素净，光脚穿着，没有穿袜子，脚踝和小腿是裸露的皮肤",
 "shoes.boot_cloth": "布靴，靴筒到小腿，靴口有一圈浅色边",
 "shoes.suede": "做旧麂皮短靴，到小腿下方，靴筒有自然褶皱，低跟",
 "shoes.martin": "八孔马丁靴，鞋带系到脚踝，厚底",
 "shoes.riding": "长筒骑士靴，靴筒到膝盖下",
 "shoes.sneaker": "系带低帮运动鞋，整只脚穿在鞋里，鞋面包住脚趾、脚背和脚跟，鞋带系好，白色厚橡胶鞋底",
 "shoes.canvas": "高帮帆布鞋，白色鞋头",
 "shoes.loafer": "皮质乐福鞋，鞋面有一条横饰",
 "shoes.oxford": "系带牛津皮鞋，擦得发亮",
 "shoes.mary": "圆头玛丽珍鞋，脚背一根搭扣",
 "shoes.sandal": "平底绑带凉鞋",
 "shoes.barefoot": "赤着双脚，脚踝干净，脚背和脚趾的皮肤干净，脚趾自然平放在地面上",
 "shoes.chelsea": "皮质切尔西靴，两侧松紧带",
 "shoes.block_boot": "粗跟短靴，跟高约 5 厘米",
 "shoes.platform": "厚底松糕鞋，整块鞋底从脚尖到脚跟都厚约 5 厘米，从侧面看鞋底像一块厚厚的蛋糕，把整只脚垫高",
 "shoes.ballet": "圆头芭蕾平底鞋，鞋口一个小蝴蝶结",
 "shoes.derby": "德比皮鞋，鞋头圆润",
 "shoes.hiking": "高帮登山靴，鞋底纹路很深",
 "shoes.bball": "高帮篮球鞋，厚鞋底",
 "shoes.cowboy": "尖头牛仔靴，靴筒有压花",
 "shoes.snow": "雪地靴，靴口翻出一圈绒毛",
 "shoes.thigh": "过膝长靴，细跟，靴筒包住膝盖，靴口停在膝盖上方约一掌宽的位置",
 "shoes.mule": "穆勒鞋：鞋头包住脚趾和脚背，鞋子后面完全没有鞋帮，脚后跟整个露在鞋外，没有搭扣和带子，是一脚蹬的拖鞋式穿法",
 "shoes.kungfu": "黑面白底的功夫布鞋",
 "shoes.chaoxue": "黑面白底的厚底朝靴，靴筒到小腿",
 "shoes.geta": "原木色木屐，两根木齿，鞋带是红色",
 "headwear.zan": "发髻上横插一支细长的白玉发簪，只有一根，簪身是约半厘米粗的乳白色细长玉杆，温润半透，长度约为发髻宽度的两倍，水平横穿发髻，两端都露在发髻外面；一端是雕成一小朵祥云形状的簪头，约拇指指甲大小，另一端是圆润收细的簪尾",
 "headwear.huadian": "鬓边点缀几朵小小的珍珠珠花",
 "headwear.yuguan": "发髻上戴一顶小巧的白玉发冠，横插一根同色簪子",
 "headwear.futou": "头戴黑色幞头，两根硬脚向两侧平伸",
 "shoes.heel": "尖头细高跟鞋，跟高约 7 厘米"
};
