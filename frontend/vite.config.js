import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env variables from system/process envs
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_API_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      host: true, // Need this to expose the port from container
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
