import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

const currentDir = typeof import.meta.dirname !== 'undefined'
  ? import.meta.dirname
  : (import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd())

function stripEnvBom(dir: string) {
  try {
    const envFiles = ['.env', '.env.local', '.env.development', '.env.production']
    for (const file of envFiles) {
      const fullPath = path.resolve(dir, file)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        if (content.charCodeAt(0) === 0xfeff) {
          fs.writeFileSync(fullPath, content.slice(1), 'utf8')
        }
      }
    }
  } catch {
    // Ignore in read-only environments
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  stripEnvBom(currentDir)
  if (process.cwd() !== currentDir) {
    stripEnvBom(process.cwd())
  }

  const envFromDir = loadEnv(mode, currentDir)
  const envFromCwd = loadEnv(mode, process.cwd())
  const rawBaseUrl =
    process.env.VITE_BASEURL ||
    process.env.VITE_BASE_URL ||
    process.env.APPSETTINGS_APIURL ||
    process.env.API_URL ||
    envFromDir.VITE_BASEURL ||
    envFromDir.VITE_BASE_URL ||
    envFromCwd.VITE_BASEURL ||
    envFromCwd.VITE_BASE_URL

  const baseUrl = rawBaseUrl?.trim()

  // Without a base URL every API call silently goes to the app's own host; fail the pipeline build instead.
  if (command === 'build' && process.env.TF_BUILD && !baseUrl) {
    throw new Error('VITE_BASEURL is missing from .env (check the file has no BOM).')
  }

  return {
  plugins: [react()],
  base: "/",
  define: baseUrl
    ? {
        'import.meta.env.VITE_BASEURL': JSON.stringify(baseUrl),
      }
    : undefined,
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
  }
})
