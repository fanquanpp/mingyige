# 鸣依阁

给虚拟歌手**洛天依**的个人圆梦网站：放一点歌、一点图、一点想说的话。
不是同人社，没有社区功能，只做小而完整的内容展示。

**主站：[https://mingyige.pages.dev](https://mingyige.pages.dev)**（分享给朋友直接发这个链接）

参考气质：[洛水天依](https://luoshuitianyi.top/)

## 技术栈

Vite 7 + React 19 + TypeScript (strict) + CSS Modules + Motion + GSAP

- **动效分工**：入出场/位移/透明度交给 Motion（开场时间线、页面切换），环境层（星光、彩带）交给纯 CSS，侧滑面板交给 GSAP
- **字体**：[马善政 Ma Shan Zheng](https://fonts.google.com/specimen/Ma+Shan-Zheng)（@fontsource 按需分片加载）
- **hash 路由**：首页 `#home` / 歌曲 `#songs`（支持 `#songs/<albumKey>` 专辑筛选深链）/ 图集 `#gallery` / 免责声明 `#disclaimer`，导航全是锚点链接，`src/navigation.ts` 集中管理
- **亮色单主题**（2026-11-07 定）：柔和纸感青灰底，token 全在 `SiteChrome.module.css`；品牌点缀蓝 `#66ccff`（光标、文字选中、扁平色块）
- **全站位图统一 WebP**（2026-11-08）：素材总体积 7.6MB→2.6MB
- **音源 192kbps mp3**（2026-11-08）：无损转码，551MB→342MB，加载提速 2.3 倍

## 常用命令

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器（http://localhost:5173）
npm run build     # 类型检查 + 产物构建
npm run preview   # 预览构建产物
```

## 页面

- **首页**：主视觉（手写体大字排版 + 竖排信息行 + 签名水印）+ 音乐播放器面板（旋转唱片/进度拖拽/同步歌词）+ 歌曲目录（五专辑分组点播）
- **歌曲**：进站默认曲《万分之一的光（钢琴版）》+ 五张官方专辑分组点播（依如初见 2022 / 无尽蓝 2022 / 再生 2024 / 四重奏 2026 / Lost In Tianyi 2018），支持专辑筛选深链
- **图集**：插画、官方物料、品牌标识分组网格 + 灯箱放大（Esc/点遮罩关闭）；说明文字只写画面可验证的内容
- **免责声明**：站点性质、素材版权、免责范围（侧边栏入口；参考源 `docs/DISCLAIMER.md`）

## 音乐播放

全站**唯一音乐播放器**（`src/audio/music.ts`，单音频实例 + 单列表）：

- 进站自动起播默认曲《万分之一的光（钢琴版）》——被浏览器拦截时，首次有效点击（「轻触共鸣」浮现后）自动响起；开场动画阶段的点击不算进站手势
- 播完自动接下一首循环全列表；歌曲页点播直接切全局播放器，离开页面音乐继续放
- **跨标签唯一播放权**：同一浏览器多标签只有持锁标签出声（localStorage 锁 + 心跳）；点播放即接管
- **进度记忆**：默认曲播放位置定期存档，刷新续播

## 交互时间线（开场动画）

1. 星海背景缓慢拉近 + 手写体十句依次发光浮现（横竖屏各按素材图排布；移动端禁 filter 动画防 GPU 重影）
2. 收尾句停留后，整幅海报模糊合拢（横屏图2 / 竖屏图3）
3. 浮现「轻触共鸣」→ 全屏点击**直达主页**（与右上角 `S p i k` 完全同款退场逻辑：舞台淡出 → 真实绘制帧 → 切页 → 旧舞台延迟卸载；Resonance 中间页已按 2026-11-08 决定移除）
4. 带 `#songs` 等 hash 刷新时，仪式结束后落到对应页面（深链保留）

## 设计约束

见 [docs/design-rules.md](docs/design-rules.md)——硬性禁令清单（无荧光/辉光/光晕/混渐变/AI 味边框/弧形/emoji），任何 UI 先过这道检查。

## 站点结构

```
├─ docs/
│  ├─ design-rules.md        # 设计硬性禁令与控件写法规范（随仓库走）
│  └─ DISCLAIMER.md          # 免责声明（前端渲染源）
├─ public/
│  ├─ audio/                 # 五张专辑音源（192k mp3，342MB）+ 默认曲
│  ├─ images/
│  │  ├─ albums/             # 专辑封面（webp）
│  │  ├─ gallery/            # 图集（webp）
│  │  └─ brand/              # 手写签名、站章（webp/svg）
│  ├─ lyrics/                # 逐字歌词 JSON（lostintianyi 部分为近似时间轴）
│  ├─ _headers               # 安全响应头 + 缓存策略（Cloudflare Pages）
│  └─ robots.txt             # 禁止索引音源目录
├─ src/
│  ├─ navigation.ts          # 页面清单、导航锚点、hash 解析
│  ├─ data/site-content.ts   # 专辑/曲目/图集素材清单（trackDisplayName 去 feat. 标注）
│  ├─ audio/music.ts         # 全站唯一音乐播放器（手势起播/跨标签锁/进度记忆/连播）
│  ├─ App.tsx                # 开场/页面两态 + 统一退场序 + hash 深链
│  └─ components/
│     ├─ site/               # SiteChrome（顶栏+侧滑面板+页脚声明）
│     ├─ intro/              # 入场动画（frozen 定格、移动端 lite 模式）
│     ├─ fx/TargetCursor     # 四角括号自定义光标（#66ccff）
│     ├─ home/               # Hero（40dvh）+ MusicPanel + SongDirectory
│     └─ pages/              # Songs / Gallery / Disclaimer
└─ .github/workflows/        # GitHub Pages 镜像自动部署
```

## 部署

### 主站 · Cloudflare Pages

- **https://mingyige.pages.dev**（免费计划：带宽不限、单文件 ≤25MB、每月 500 次构建；纯静态无后端，免费计划不绑付款方式、被刷也不会产生账单）
- 部署命令：`npx wrangler pages deploy dist --project-name mingyige`（首次 `npx wrangler login` 授权）
- 安全防护：`public/_headers`（nosniff / DENY / Referrer-Policy / 缓存分层：HTML 不缓存、JS/CSS 一年 immutable、音频 30 天 + Accept-Ranges 拖进度秒响应）
- **国内访问**：`*.pages.dev` 未备案，走 Cloudflare 海外节点（HTML 正常、大文件偏慢）。要国内流畅需自有域名 + ICP 备案接入 Cloudflare，或换国内托管（EdgeOne Pages 等）

### 镜像 · GitHub Pages

- 仓库：[fanquanpp/mingyige](https://github.com/fanquanpp/mingyige)，`.github/workflows/deploy-pages.yml` 自动构建（push main 触发）
- 地址：https://fanquanpp.github.io/mingyige/ —— 音源 342MB 已入库（192k mp3 单文件 ≤10MB，低于 GitHub 100MB 限制），镜像**功能完整**
- 构建产物 base 为相对路径（`base: './'`），dev/preview 不受影响
