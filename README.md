# XG AIGC 工具箱 · 更衣室

在网页上点选人物的长相、发型、服装和鞋子，拼出一段完整的**人物三视图提示词**（大头照 + 全身正面 + 全身背面），旁边配上每个部件的**局部参考图**。每张局部图用的提示词也能点开复制。所有提示词和做法全部公开，方便大家拿去用或参考。

- 只做人类，先做女生，男生和中性发型也有。
- 服装分**上装 / 下装 / 连体**，也可以一键换整套（套装）。
- 颜色只给关键色，别的颜色和细节直接在提示词框里改。
- 网站上的图全部由 Krea 2（官方 Turbo + 中文提示词，本地 ComfyUI）生成。Z-Image、Qwen 2.1、GPT-image2 只提供提示词写法，切换模型只换提示词。
- 界面语言：简体中文、繁體中文、English、日本語、한국어。
- 不做裸体，最多到泳装和 V 领（默认关）；不放手持道具。

## 本地运行

```bash
npm install
npm run dev            # 开发预览，局域网可访问
npm run build          # 打包到 dist/，图片在 dist/images/
npm run build:single   # 打包成单个 dist-single/index.html，图片另外放在旁边的 images/ 里
```

## 目录

```
src/
  App.vue                 页面骨架
  components/             TopBar 顶部导航 · SidePanel 左栏 · StagePanel 效果图 · PromptDrawer 提示词 · ZoomDialog 放大 · AboutPage 关于
  components/ui/          折叠、Tabs、选项、颜色、带图格子、锁定按钮
  data/                   条目数据（人物、发型、头饰、服装部件和套装、鞋、颜色、人种、模型）；tiles.js 局部图模板；about.js 关于页
  lib/catalog.js          条目整理、颜色规则
  lib/store.js            全局状态、默认值、过滤
  lib/prompt.js           三视图提示词（qwen / zimage / krea / long 几种写法）
  lib/tilePrompt.js       局部图提示词；网站抽屉和跑图工具包（build_jobs.mjs）共用，图和提示词一一对应
  lib/images.js           局部图查找、缺失项
  i18n/                   界面文字（5 种语言）；items/ 是条目名翻译
public/images/            局部图
tools/                    数据转换、翻译辅助脚本；sync-images.mjs 把跑图输出收进 public/images 和 images.json
```

## 局部图命名

```
images/<模型>/<f|m|u>/<分类>/<条目id>__<颜色id|def>.webp
```

- 模型目录：目前只有 `krea2`。
- `f` 女、`m` 男、`u` 通用。分类：`hair`、`headwear`、`top`、`bottom`、`onepiece`、`shoes`。
- `def` 表示默认色（提示词里不写颜色）。
- 生成后用 `node tools/sync-images.mjs <跑图输出目录>` 把图复制进 `public/images/`、登记进 `src/data/images.json`（`{"<路径去掉 images/ 和 .webp>": {"v": 版本号}}`），顺便核对图是不是用现在的提示词出的。

局部图取景：发型和头饰用同一张默认脸；上装拍到大腿，下身配素色灰裤，不露脸；下装只拍裤子或裙子；连体拍到脚踝；鞋子只拍大腿以下。全部 1:1。

提示词分段（三视图和局部图同一套）：图片任务 / 版式 / 人物 / 头发 / 头饰 / 服装 / 拍摄设置 / 质量 / 画面要求（GPT-image2、即梦用「避免」）。

## 加一个模型

在 `src/data/models.js` 里加一行：`dir` 是图片目录，`tiles` / `sheet` 表示网站上有没有它出的局部图 / 三视图样例，`fmt` 是提示词写法（在 `src/lib/prompt.js` 的 `buildPrompt` 里）。

## 多语言

- 界面文字在 `src/i18n/<语言>.js`，5 个文件的键要一致。
- 条目名在 `src/i18n/items/<语言>.json`，键是 `分类.id`（服装部件是 `part.id`，套装是 `set.id`）。没翻的显示中文。
- 繁体用 OpenCC 自动转：`npm run names:dump && npm run i18n:tw`；人工改过的写进 `src/i18n/items/zh-TW.fix.json`。

## 许可

- 代码：MIT（见 LICENSE）。
- 提示词和网站文字：CC0 1.0。
- 更衣室、场景里 Krea 2 生成的图，三视图页「站长生成」的三视图，运镜页的演示视频：CC0 1.0，商用、修改都可以，不用署名。
- 例外：三视图页「网络热门」和提示词页的部分示例图是 AI 产品、游戏角色的拟人或同人改编，角色归原作者和原公司，不是 CC0，每张写了出处和协议。案例页的视频片段只在页面播放，不提供下载。
- 图片都是 AI 生成的虚构人物；请合法使用，发布时按当地法律标明 AI 生成。详见网站「关于」页。
