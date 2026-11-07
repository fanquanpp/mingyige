import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // .mimosa 是工具的内部状态目录，文件被锁会导致 watcher 崩溃；
      // public/audio 下 1.9GB 音源变化也会压垮 watcher（静态资源无需热更）
      ignored: ['**/.mimosa/**', '**/public/audio/**', '**/public/lyrics/**', '**/public/video/**'],
    },
  },
})
