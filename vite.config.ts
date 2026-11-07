import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子路径部署（fanquanpp.github.io/mingyige/）：
  // 本站为 hash 路由（#home/#songs/#gallery），无需 history fallback，只需静态资源 base 对齐。
  // 站内音频/歌词/图片的运行时引用一律用相对路径（代码里不带前导 /），
  // base './' 只对齐打包资源，两者配合才能在子路径下不 404；dev 与 preview 不受影响。
  base: './',
  server: {
    watch: {
      // chokidar v4 的 glob ignore 不可靠（.mimosa 文件锁曾致 EBUSY 崩溃），改用函数谓词；
      // 排除工具状态目录与大体量静态资源（音源 ~500MB，无需热更）
      ignored: [
        (path: string) =>
          /[\\/]\.mimosa[\\/]/.test(path) ||
          /[\\/]public[\\/](audio|lyrics|video)[\\/]/.test(path),
      ],
    },
  },
})
