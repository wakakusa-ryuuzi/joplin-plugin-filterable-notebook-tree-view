import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const rootDir = path.resolve(__dirname, 'src/webview');

export default defineConfig({
  plugins: [vue()],
  root: rootDir,
  build: {
    outDir: path.resolve(__dirname, 'dist-webview'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(rootDir, 'webview.ts'),
      output: {
        entryFileNames: 'webview.js',
        format: 'iife',
        name: 'webview',
      },
    },
  },
  server: {
    middlewareMode: false,
    port: 5173,
    cors: true,
  },
});
