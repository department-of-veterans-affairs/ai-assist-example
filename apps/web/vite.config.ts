import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Get the current file path
const script_dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, script_dir);

  // Use base path only for production builds, not local development
  const isProduction = mode === 'production';
  const base = isProduction ? env.VITE_PUBLIC_URL || '/ai-assist/' : '/';

  return {
    base,
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT) || 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          // uncomment to strip console and debugger statements in production builds
          /*
          drop_console: true,
          drop_debugger: true,
          */
        },
      },
      chunkSizeWarningLimit: 2100,
    },
  };
});
