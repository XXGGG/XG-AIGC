/* 服装细节：提示词抽屉「细节」区里按当前穿的衣服给选项，选了只写进三视图提示词，不出局部图。
   只给素面、能加点缀的款式；下面这些不给细节：
   - 本身就靠花样定义的（苗绣、秀禾、马面裙织金、碎花、格纹、印花卫衣、水钻T恤、蕾丝婚纱、哥特、洛丽塔、藏袍、蒙古袍、苏格兰裙等），再加会打架；
   - 制服、工装、运动、泳装：形制固定，乱加不像；
   - 大多数裤子：细节在裤子上基本看不出来。 */
export const WEAR_DETAILS=[
  /* id, 名称, 句子 */
  ["emb_chest","胸前小刺绣","左胸绣着一朵指甲盖大小的小花"],
  ["print_chest","胸前印花","胸前正中印着一个手掌大小的简单几何图案，图案里没有文字"],
  ["cable","麻花纹","衣身正面织着几道竖向的粗麻花纹"],
  ["fairisle","提花领圈","领口下方织着一圈雪花和几何纹的彩色提花"],
  ["collar_emb","领尖刺绣","两边领尖各绣着一朵很小的同色系小花"],
  ["pearl_btn","珍珠扣","前襟的纽扣换成一颗颗圆润的小珍珠扣"],
  ["denim_patch","刺绣贴布","布面上缝着三四枚小小的刺绣花朵贴布"],
  ["denim_rip","膝盖破洞","两个膝盖上各有一道横向的磨破口子"],
  ["denim_studs","铆钉","领子和口袋盖边缘钉着一排小小的银色圆铆钉"],
  ["sequin","亮片","布面上点缀着细密的小亮片，带一点细碎的闪光"],
  ["pearl_neck","领口珍珠","领口边缘钉着一圈细小的白色珍珠"],
  ["lace_hem","蕾丝下摆","下摆镶着一圈约两指宽的同色蕾丝花边"],
  ["flower_emb","花卉刺绣","布面上绣着几枝淡雅的花卉，绣线颜色比底色略深"],
  ["dark_pattern","暗纹","布料上织着若隐若现的同色暗纹，侧光下才看得出来"],
  ["collar_border","领缘绣边","领口和衣襟边缘绣着一道约两指宽的缠枝花纹边"],
  ["cuff_emb","袖口绣边","两只袖口各绣着一圈细细的缠枝花纹"],
  ["hem_emb","裙摆刺绣","裙摆上绣着一圈淡雅的缠枝花纹"],
  ["gold_hem","织金底边","裙摆底边镶一圈约两指宽的金色织金花边"],
  ["kimono_print","花卉纹样","衣面印着淡雅的樱花和流水纹样"],
  ["hanbok_emb","金箔纹样","上衣领口、袖口和裙摆印着细细的金箔花纹"],
  ["pocket_sq","口袋巾","左胸手巾袋里露出一角白色口袋巾"],
  ["brooch","胸针","左边翻领上别着一枚小小的银色胸针"],
  /* 材质：所有衣服都能选（10-27 用户要） */
  ["aged","做旧","布料有自然的做旧感：边缘、接缝和容易摩擦的地方轻微磨白起毛，颜色略微褪色，像穿过很多年"]
];
/* 细节分类：材质类（改变布料本身）和装饰类（加在衣服上的东西） */
export const WD_MATERIAL=["aged","dark_pattern","denim_rip"];
const TEE=["emb_chest","print_chest"],KNIT=["cable","fairisle","emb_chest"],SHIRT=["collar_emb","pearl_btn"],
  GOWN=["sequin","pearl_neck","lace_hem"],HAN_TOP=["collar_border","cuff_emb","dark_pattern"],
  HAN_SKIRT=["hem_emb","gold_hem","dark_pattern"],SUIT=["pocket_sq","brooch"];
/* 部件 id → 能加的细节 */
export const PART_DETAILS={
  tee_crew:TEE,hoodie_pullover:TEE,tee_baby:[],
  sweater_chunky:KNIT,cardigan_chunky:["cable","emb_chest","pearl_btn"],vest_knit_shirt:["cable","emb_chest"],
  shirt_oxford:SHIRT,shirt_office:SHIRT,
  jacket_denim:["denim_patch","denim_studs"],jeans_straight:["denim_patch","denim_rip"],jeans_baggy:["denim_patch","denim_rip"],
  jeans_flare:["denim_patch"],overalls_denim:["denim_patch"],
  skirt_pleated_midi:["lace_hem","flower_emb"],dress_slip_cardigan:["lace_hem","pearl_neck"],
  gown_satin:GOWN,cocktail_velvet:GOWN,mermaid_gown:GOWN,deepv_dress:["sequin","lace_hem"],
  qipao_silk:["flower_emb","dark_pattern"],aodai_full:["flower_emb","collar_border"],
  jiaoling_ru:HAN_TOP,changao:HAN_TOP,liling_ao:HAN_TOP,beizi_jacket:["collar_border","flower_emb","dark_pattern"],
  pifeng_coat:["collar_border","dark_pattern"],daxiu_shan:["collar_border","flower_emb"],gauze_daxiu_robe:["collar_border","flower_emb"],
  yuanling_robe:["collar_border","cuff_emb","dark_pattern"],quju_robe:["flower_emb","dark_pattern"],
  qixiong_skirt:HAN_SKIRT,hanfu_pleat_skirt:HAN_SKIRT,
  kimono_furisode:["kimono_print"],hanbok_dress:["hanbok_emb"],
  jacket_suit3:SUIT,double_breasted_jacket:SUIT,tuxedo_jacket:SUIT,blazer_fitted:["brooch"],coat_wool:["brooch"],coat_trench:["brooch"]
};
/* 加了细节就去掉和它打架的「素面」说法 */
export const PLAIN_RE=/[，；]?(衣面是素净的纯色[，、]?没有图案|衣面是素净的纯色|衣面素净没有图案|表面没有任何装饰|没有图案|布面素净没有花纹)/g;
