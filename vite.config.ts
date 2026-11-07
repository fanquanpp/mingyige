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
      // 音源仍较大（~500MB），watcher 排除避免文件锁/全量扫描开销；静态资源无需热更
      ignored: ['**/public/audio/**', '**/public/lyrics/**'],
    },
  },
})
