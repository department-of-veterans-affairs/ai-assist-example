import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Get the current file path
const script_dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, script_dir);
  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT) || 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8001',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2100, // Increase to 2.1MB to accommodate VACDS
      rollupOptions: {
        output: {
          manualChunks: {
            // Split VACDS into its own chunk
            vacds: ['@department-of-veterans-affairs/clinical-design-system'],
          },
        },
      },
    },
  };
});
