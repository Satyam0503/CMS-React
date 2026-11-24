import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const currentDir = typeof import.meta.dirname !== 'undefined'
  ? import.meta.dirname
  : (import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: process.env.VITEST
      ? [
          {
            find: /^@mui\/icons-material($|\/.*)/,
            replacement: path.resolve(currentDir, 'src/test/iconMock.tsx'),
          },
        ]
      : [],
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        // ponytail: theme SCSS still uses @import and global fns; migrate to @use before Dart Sass 3 removes them.
        silenceDeprecations: ["import", "global-builtin", "if-function", "color-functions", "abs-percent"],
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve(currentDir, 'src/test/setup.ts')],
    include: ["src/**/*.test.{ts,tsx}"],
    pool: "threads",
    // Keep local runs parallel, but avoid exhausting file handles on the
    // Windows self-hosted Azure DevOps agent.
    maxWorkers: process.env.CI ? 2 : undefined,
    fileParallelism: process.env.CI ? false : true,
  },
})
