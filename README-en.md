<div align="center">
  <img src="docs/images/logo.png" width="128" alt="XG-AIGC">
</div>

<h1 align="center">XG-AIGC</h1>

<p align="center">
  <a href="https://xgai.xiexiage.com"><img alt="Visit site" src="https://img.shields.io/badge/Visit%20site-xgai.xiexiage.com-2f7cf6?style=for-the-badge"></a>
  <a href="https://xg-aigc.pages.dev/"><img alt="Mirror" src="https://img.shields.io/badge/Mirror-xg--aigc.pages.dev-555?style=for-the-badge"></a>
</p>

<p align="center">An open resource site for learning AI video: prompts, reference images, character turnarounds, camera moves and full case breakdowns. All public, all free.</p>

<p align="center">
  <a href="README.md">官话 - 简体中文</a> | <a href="README-cmn_TW.md">官話 - 繁體中文</a> | <a href="README-jyut.md">廣東話</a> | English
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/code-MIT-blue">
  <img alt="Prompts: CC0" src="https://img.shields.io/badge/prompts-CC0-green">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42b883">
  <img alt="i18n" src="https://img.shields.io/badge/UI-简%20%7C%20繁%20%7C%20EN%20%7C%20日%20%7C%20한-lightgrey">
</p>

<p align="center"><img src="docs/images/wardrobe.gif" width="860" alt="Wardrobe demo"></p>

## What is this

I started learning AI video from zero and got a lot of help from people who shared their work for free. This site is my way of paying it back: the prompts, reference images and workflows I actually use, laid out in one place. No subscriptions, no paywall, no ads.

| Page | What it does |
| --- | --- |
| **Wardrobe** | Pick ethnicity, age, hairstyle, accessories, clothes and shoes to build a complete character-turnaround prompt. Every part has a reference image, and every image's prompt can be copied. |
| **Scenes** | Landscape scene images with prompts, filterable by series (Backrooms, Fairyland, Cyberpunk…) and tags. Use them as backgrounds or first frames. |
| **Turnarounds** | Ready-made character sheets (headshot + full-body front + full-body back). The ones made for this site can be downloaded at full resolution. |
| **Prompts** | Image-to-image prompts: anime 2D, chibi, 3D model, photoreal, outfit swap. Each comes with before/after examples. |
| **Camera moves** | Dozens of camera moves and shot types, each with a demo clip and a copyable prompt. |
| **Showcase** | Full project breakdowns: the model, resolution, length, reference images and original prompt behind every clip. |

The interface is available in Simplified Chinese, Traditional Chinese, English, Japanese and Korean.

## Screenshots

| Wardrobe | Scenes |
| --- | --- |
| <img src="docs/images/wardrobe.webp" alt="Wardrobe"> | <img src="docs/images/scene.webp" alt="Scenes"> |
| **Turnarounds** | **Prompts** |
| <img src="docs/images/sheet.webp" alt="Turnarounds"> | <img src="docs/images/prompt.webp" alt="Prompts"> |
| **Camera moves** | **Showcase** |
| <img src="docs/images/camera.webp" alt="Camera moves"> | <img src="docs/images/cases.webp" alt="Showcase"> |

## How to use

1. Open [xgai.xiexiage.com](https://xgai.xiexiage.com). No sign-up.
2. **Build a character**: in Wardrobe, go down the left panel (person, hair, accessories, top, bottom, shoes). The reference images update on the right. Open the prompt at the bottom right and hit Copy.
3. Paste the prompt into your image tool (Krea 2, Z-Image, Jimeng, GPT-image…) to make a turnaround, then use it for video.
4. **Find a background**: pick one in Scenes and copy its prompt, or use the image as a reference.
5. **Learn a shot**: watch the demos in Camera moves and append the camera prompt to your video prompt.
6. **See how it's done**: open Showcase and step through each clip's reference images and prompt.

<p align="center"><img src="docs/images/cases.gif" width="860" alt="Showcase demo"></p>

<p align="center"><img src="docs/images/prompt.gif" width="860" alt="Prompts page demo"></p>

## Run locally

Requires Node.js 20.19 or newer.

```bash
git clone https://github.com/XXGGG/XG-AIGC.git
cd XG-AIGC
npm install
npm run dev      # dev server, reachable on your LAN
npm run build    # build to dist/, deployable to any static host
```

## Layout

```
src/
  components/   pages and components (TopBar, SidePanel, StagePanel, LibSplit, CasePage…)
  data/         catalog data: people, hair, clothes, shoes, scenes, camera moves, cases
  lib/          prompt builders, state, image lookup
  i18n/         UI text in five languages
public/
  images/       part reference images (images/<model>/<f|m|u>/<category>/<id>__<color>.webp)
  cases/ camera/ sheets/   showcase clips, camera demos, full-size turnarounds
tools/          image sync and translation helper scripts
```

## License

- **Code**: [MIT](LICENSE).
- **Prompts and site text**: CC0 1.0. Use, modify and sell freely, no credit needed.
- **Images and videos made for this site** (Wardrobe, Scenes, the site-made turnarounds, camera demos): CC0 1.0.
- **Exceptions**: the "Trending online" turnarounds and some Prompts page examples are fan adaptations of AI-product mascots and game characters. The characters belong to their creators and companies and are not CC0; each one lists its source and license. Showcase clips are for viewing on the site only.
- Every image is AI-generated and every person is fictional. Follow your local laws and label AI content where required. See the site's About page for details.

If you think an image infringes your rights, please open an [Issue](https://github.com/XXGGG/XG-AIGC/issues) and it will be taken down after review.
