/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const target = env.VITE_SAMEDAY_API_BASE_URL || 'https://sameday-api.demo.zitec.com';
  const hasApiSuffix = /\/api\/?$/.test(target);
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: hasApiSuffix ? (path: string) => path.replace(/^\/api/, '') : undefined
        }
      }
    }
  };
});


