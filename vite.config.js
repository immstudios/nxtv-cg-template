import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
  build: {
    minify: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    target: "es2015",
    rollupOptions: {
      input: 'main.html',
    }
  }
});
