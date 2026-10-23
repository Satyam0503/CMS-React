import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: process.env.VITEST
      ? [
          {
            find: /^@mui\/icons-material($|\/.*)/,
            replacement: path.resolve(__dirname, 'src/test/iconMock.tsx'),
          },
        ]
      : [],
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    pool: "threads",
    // Keep local runs parallel, but avoid exhausting file handles on the
    // Windows self-hosted Azure DevOps agent.
    maxWorkers: process.env.CI ? 2 : undefined,
    fileParallelism: process.env.CI ? false : true,
  },
})
