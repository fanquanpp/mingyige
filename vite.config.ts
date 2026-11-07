import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子路径部署（fanquanpp.github.io/mingyige/）：
  // 本站为 hash 路由（#home/#songs/#gallery），无需 history fallback，只需静态资源 base 对齐。
  // 站内音频/歌词/图片均为 /audio/... 绝对路径 —— 会指向域名根而 404，
  // 因此 base 改为相对（资源以当前文档路径解析），dev 与 preview 不受影响。
  base: './',
  server: {
    watch: {
      // .mimosa 是工具的内部状态目录，文件被锁会导致 watcher 崩溃；
      // public/audio 下 1.9GB 音源变化也会压垮 watcher（静态资源无需热更）
      ignored: ['**/.mimosa/**', '**/public/audio/**', '**/public/lyrics/**', '**/public/video/**'],
    },
  },
})
