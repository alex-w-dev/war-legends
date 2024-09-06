import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // it is used fror development
  optimizeDeps: {
    include: ['rts-kit'],
  },
  // correct building
  build: {
    commonjsOptions: {
      include: [/rts-kit/, /node_modules/],
    },
  },
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
