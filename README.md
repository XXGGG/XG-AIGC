<div align="center">
  <img src="docs/images/logo.png" width="128" alt="XG-AIGC">
</div>

<h1 align="center">XG-AIGC</h1>

<p align="center">
  <a href="https://xgai.xiexiage.com"><img alt="访问网站" src="https://img.shields.io/badge/访问网站-xgai.xiexiage.com-2f7cf6?style=for-the-badge"></a>
  <a href="https://xg-aigc.pages.dev/"><img alt="备用地址" src="https://img.shields.io/badge/备用地址-xg--aigc.pages.dev-555?style=for-the-badge"></a>
</p>

<p align="center">学习 AI 视频的开源资料站：提示词、参考图、三视图、运镜和案例，全部公开，免费使用。</p>

<p align="center">
  官话 - 简体中文 | <a href="README-cmn_TW.md">官話 - 繁體中文</a> | <a href="README-jyut.md">廣東話</a> | <a href="README-en.md">English</a>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/code-MIT-blue">
  <img alt="Prompts: CC0" src="https://img.shields.io/badge/prompts-CC0-green">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42b883">
  <img alt="i18n" src="https://img.shields.io/badge/UI-简%20%7C%20繁%20%7C%20EN%20%7C%20日%20%7C%20한-lightgrey">
</p>

<p align="center"><img src="docs/images/wardrobe.gif" width="860" alt="更衣室演示"></p>

## 这是什么

我也是从零开始学 AI 视频的，受过很多前辈无私分享的帮助，所以把自己用过的提示词、参考图和做法都摊开来，做成当初自己最需要的地方。没有订阅、付费和广告。

| 页面 | 能做什么 |
| --- | --- |
| **更衣室** | 点选人种、年龄、发型、饰品、衣服和鞋子，拼出一段完整的人物三视图提示词；每个部件都有参考图，每张图的提示词都能复制。 |
| **场景** | 横屏场景图和提示词，按系列（后室、仙境、赛博朋克……）和标签筛选，拿来当背景或首帧。 |
| **三视图** | 现成的人物三视图（大头照 + 正面全身 + 背面全身），站长生成的可以直接下载原图。 |
| **提示词** | 动漫 2D 化、Q 版、建模 3D 化、转真人、换衣服等图生图提示词，每组都有原图和效果对比。 |
| **运镜 · 镜头** | 几十种运镜和镜头语言，每种配一段演示视频和可复制的提示词。 |
| **案例** | 完整作品拆解：每个片段用的模型、分辨率、时长、参考图和原始提示词。 |

界面支持简体中文、繁體中文、English、日本語、한국어。

## 截图

| 更衣室 | 场景 |
| --- | --- |
| <img src="docs/images/wardrobe.webp" alt="更衣室"> | <img src="docs/images/scene.webp" alt="场景"> |
| **三视图** | **提示词** |
| <img src="docs/images/sheet.webp" alt="三视图"> | <img src="docs/images/prompt.webp" alt="提示词"> |
| **运镜 · 镜头** | **案例** |
| <img src="docs/images/camera.webp" alt="运镜"> | <img src="docs/images/cases.webp" alt="案例"> |

## 怎么用

1. 打开 [xgai.xiexiage.com](https://xgai.xiexiage.com)，不用注册。
2. **做人物**：进「更衣室」，在左栏依次选人物、发型、饰品、上装、下装、鞋子。右边会实时显示对应的参考图，右下角打开提示词，点「复制」。
3. 把提示词贴进你常用的生图工具（Krea 2、Z-Image、即梦、GPT-image 等）生成三视图，再拿三视图去做视频。
4. **找背景**：进「场景」挑一张，复制提示词自己生成，或直接拿图当参考。
5. **学镜头**：进「运镜 · 镜头」看演示视频，把运镜提示词接在你的视频提示词后面。
6. **参考提示词整体写法**：进「案例」，按片段看每一段用了什么参考图和提示词。

<p align="center"><img src="docs/images/cases.gif" width="860" alt="案例页演示"></p>

<p align="center"><img src="docs/images/prompt.gif" width="860" alt="提示词页演示"></p>

## 本地运行

需要 Node.js 20.19 以上。

```bash
git clone https://github.com/XXGGG/XG-AIGC.git
cd XG-AIGC
npm install
npm run dev      # 开发预览，局域网也能访问
npm run build    # 打包到 dist/，可以直接放到任何静态托管
```

## 目录

```
src/
  components/   页面和组件（TopBar、SidePanel、StagePanel、LibSplit、CasePage……）
  data/         条目数据：人物、发型、服装、鞋子、场景、运镜、案例
  lib/          提示词生成、状态、图片查找
  i18n/         五种语言的界面文字
public/
  images/       局部参考图（images/<模型>/<f|m|u>/<分类>/<id>__<颜色>.webp）
  cases/ camera/ sheets/   案例片段、运镜演示、三视图原图
tools/          图片同步和翻译辅助脚本
```

## 授权

- **代码**：[MIT](LICENSE)。
- **提示词和网站文字**：CC0 1.0，商用、修改都可以，不用署名。
- **站长生成的图和视频**（更衣室、场景、三视图页「站长生成」、运镜演示）：CC0 1.0。
- **例外**：三视图页「网络热门」和提示词页部分示例图，是 AI 产品、游戏角色的拟人或同人改编，角色归原作者和原公司，不是 CC0，每张都写了出处和协议，请照着用。案例页的视频片段只供在线观看。
- 所有图片都由 AI 生成，人物是虚构的。请遵守当地法律，发布时按规定标明 AI 生成。详见网站「关于」页。

如果觉得哪张图侵犯了你的权利，请提 [Issue](https://github.com/XXGGG/XG-AIGC/issues)，核实后会尽快撤下。
