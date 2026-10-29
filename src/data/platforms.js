/* 推荐平台（10-28 用户定格式）：第一行最重要，写非会员能不能生成视频（ok=能）；第二行写送多少积分，下面缩进写每秒多少积分；图标在 public/platforms/<id>.png（各平台官网的站标）
   数字是用户 10-27 自己逐个注册侦察的；豆包 10-29 用户定：目前最好，占满一行；5 秒的 SD2.0 Mini 能生成 10 个 */
export const PLAT_NOTE="视频最短 4 秒。即梦和小云雀每天北京时间 12:00 刷新积分。积分和价格经常变，具体情况请自行到平台查看。";
export const PLATFORMS=[
  {id:"doubao",name:"豆包",url:"https://www.doubao.com",ok:1,best:1,head:"非会员每日可生成 10 个 5 秒的 SD2.0 Mini 视频，0 点额度重置",more:["目前最推荐"]},
  {id:"xiaoyunque",name:"小云雀",url:"https://xyq.jianying.com",ok:1,head:"非会员可生成 6 次 SD2.0 Mini 视频",
    free:"每天送 60–66 积分",sub:["SD2.0 Mini 体验版（5 次）：每秒 4 积分","SD2.0 Mini（1 次）：每秒 6 积分"],more:["能生成 10–11 秒，默认 720P"]},
  {id:"jimeng",name:"即梦",url:"https://jimeng.jianying.com",ok:0,head:"非会员无法生成视频",
    free:"每天送 60–66 积分",sub:["会员 Seedance 2.0：每秒 8 积分","会员 Seedance 2.0 Fast：每秒 5 积分"],more:["默认 720P"]},
  {id:"tapnow",name:"TapNow",url:"https://www.tapnow.ai",ok:1,head:"新用户可生成 SD2.0 Mini 视频",
    free:"新用户送积分，30 天内有效",sub:["SD2.0 Mini（全能参考 16:9、480P、5 秒）：每次 30 积分"],more:["官方只写了新用户赠送，有没有每天送没写"]},
  {id:"lovart",name:"Lovart",url:"https://www.lovart.ai",ok:0,head:"非会员无法生成 Seedance 视频",
    free:"每天送 30 积分",sub:["可以生图（1–3 张）"]},
  {id:"libtv",name:"LibTV",url:"https://www.liblib.tv",ok:0,head:"非会员无法生成 Seedance 视频",
    free:"每天送 20 积分"},
  {id:"oiioii",name:"OiiOii",url:"https://www.oiioii.ai",ok:0,head:"非会员无法生成视频",
    free:"每天送 10 积分，3 天内过期"}
];
