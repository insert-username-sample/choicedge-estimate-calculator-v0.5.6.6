import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.', // Ensure this is correctly set
  base: './', // Ensure relative pathing
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Ensure src alias works
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
    },
  },
});
