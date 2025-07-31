import path, { dirname } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";

// Get the current file path
const script_dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, script_dir);
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(script_dir, "src"),
      },
    },
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT) || 3000,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8001",
          changeOrigin: true,
        },
      },
    },
  };
});
