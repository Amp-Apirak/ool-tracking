import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // Load env variables based on the current mode
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],
    // Set base path from environment variable
    base: env.VITE_APP_BASE_PATH || '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: false, // Disable Vite's default error overlay
      },
    },
  };
});
