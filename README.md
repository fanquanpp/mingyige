# 鸣依阁

给虚拟歌手**洛天依**的超小型个人圆梦网站：放一点歌、一点图、一点想说的话。
不是同人社，没有社区功能，只做小而完整的内容展示。

参考气质：[洛水天依](https://luoshuitianyi.top/)

## 技术栈

Vite 7 + React 19 + TypeScript (strict) + CSS Modules + Motion

- 动效分工：入出场/位移/透明度交给 Motion，环境层（星光、彩带、波浪线）交给纯 CSS
- 字体：[马善政 Ma Shan Zheng](https://fonts.google.com/specimen/Ma+Shan+Zheng)（@fontsource 本地分片加载）
- **hash 路由**：首页 `#home` / 歌曲 `#songs` / 图集 `#gallery`，导航全部是锚点链接，`src/navigation.ts` 集中管理
- **亮色单主题**（2026-11-07 定）：柔和纸感青灰底，token 全在 `SiteChrome.module.css`

## 常用命令

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器（http://localhost:5173）
npm run build     # 类型检查 + 产物构建
npm run preview   # 预览构建产物
```

## 站点结构

```
├─ docs/
│  ├─ design-rules.md        # 设计硬性禁令与控件写法规范（随仓库走）
│  └─ materials/             # 原始素材归档（开场动画图1/图2/图3）
├─ public/
│  ├─ audio/                 # 音乐列表音源：钢琴版 mp3（默认曲）+ 三首歌曲 m4a
│  ├─ video/                 # 歌曲 MV mp4（资源暂存，站点暂未使用）
│  └─ images/
│     ├─ intro/              # 开场动画用图（星海背景 + 两端海报）
│     ├─ gallery/            # 图集（洛天依插画、群像、VOCALOID CHINA 官方插画、立绘）
│     ├─ icons/              # 天依圆标 icon-tianyi.svg（logo/图标）+ VSINGER 六人图标（备用）
│     └─ brand/              # 手写签名、站章
├─ src/
│  ├─ index.css              # 全局基础样式 + 未接线的色板草稿
│  ├─ navigation.ts          # 页面清单、导航锚点、hash 解析
│  ├─ data/site-content.ts   # 音乐列表与图集素材清单
│  ├─ App.tsx                # 开场/共鸣/页面三态 + hash 深链 + 默认曲自动播放
│  ├─ audio/music.ts         # 全站唯一音乐播放器（单实例/默认曲自动播/手势兜底/跨标签唯一播放权/进度记忆/列表连播）
│  └─ components/
│     ├─ site/SiteChrome.tsx # 共享外壳：顶栏 + 侧滑面板 + 波浪线 + 页面 token + 页面标题
│     ├─ intro/              # 入场动画（每次进站/刷新完整播放）
│     ├─ fx/                 # Resonance 共鸣过渡页、TargetCursor 自定义光标、LightRays(vendored)
│     ├─ home/Home.tsx       # 首页：主视觉 + 音乐卡 + 内容入口网格
│     ├─ pages/              # SongsPage（音乐列表点播）/ GalleryPage（网格+灯箱）
│     └─ nav/ & brand/       # PillNav/StaggeredMenu/Nav 组件与 logo
└─ vite.config.ts
```

## 页面

- **首页**：主视觉（洛天依大字排版 + 签名水印）+ 音乐卡（显示当前曲目，点击暂停/继续）+ 内容入口卡
- **歌曲**：音乐列表点播——钢琴版《万分之一的光》（进站默认曲）+ 三首歌曲（万分之一的光 / 光与影的对白 / 夏虫），播完自动接下一首
- **图集**：专辑插画与项目图，响应式网格 + 灯箱放大（Esc/点遮罩关闭）；说明文字只写画面可验证的内容，画作出处待考不虚构

## 音乐播放

- 全站**唯一音乐播放器**（`src/audio/music.ts`，单音频实例 + 单列表）：
  - 进站自动播放默认曲——钢琴版《万分之一的光》；被浏览器拦截时首次用户点击自动响起
  - 播完自动接下一首，循环整个列表；顶部「音乐」按钮与首页音乐卡控制暂停/继续
  - 歌曲页点播直接切换全局播放器的曲目，离开页面音乐继续放
- **跨标签唯一播放权**：同一浏览器开多个标签时只有持锁标签出声（localStorage 锁 + 心跳）；点播放即接管。跨浏览器（不同浏览器各自开站点）无法互斥，请勿双开
- **进度记忆**：默认曲的播放位置定期存档，整页刷新后从上次位置续播
- MV 视频文件在 `public/video/` 暂存，站点暂不提供播放

## 交互时间线（开场动画）

1. 星海背景缓慢拉近 + 手写体十句依次发光浮现（横竖屏各按素材图排布）
2. 收尾句停留后，整幅海报模糊合拢（横屏图2 / 竖屏图3）
3. 磨砂补边上浮现「轻触共鸣」→ 全屏点击进入**共鸣过渡页**：全屏黑，聚光灯亮起，浮现「共鸣者 / 欢迎来到——鸣依阁」→ 关灯 → 主页亮起
4. 右上角 `S p i k`（波浪线）随时跳过；带页面 hash 刷新时，仪式结束后落到对应页面

## 设计约束

见 [docs/design-rules.md](docs/design-rules.md)——硬性禁令清单，任何 UI 先过这道检查。

## 部署（GitHub Pages）

- 仓库：[fanquanpp/mingyige](https://github.com/fanquanpp/mingyige)，Pages 由 `.github/workflows/deploy-pages.yml` 自动构建部署（push main 触发）
- 访问地址：https://fanquanpp.github.io/mingyige/
- **大素材不在仓库**：`public/audio/`（2GB 音源）与 `public/video/` 超出 GitHub 限制已 gitignore。部署后线上音乐/视频会 404；补素材方式任选：
  1. 用 [Git LFS](https://git-lfs.com) 追踪后强推（`git lfs install && git lfs track "public/audio/**"`，LFS 免费额度 1GB）
  2. 或把音频传到外部对象存储后改 `src/data/site-content.ts` 的 src 为外链
- 构建产物 base 为相对路径（`base: './'`），dev/preview 不受影响
