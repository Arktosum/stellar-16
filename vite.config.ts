import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        journal: resolve(__dirname, 'journal.html'),
        engine: resolve(__dirname, 'engine.html'),
        alu: resolve(__dirname, 'alu.html')
      }
    }
  }
});
