import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-button', '@radix-ui/react-dialog', 'framer-motion']
        }
      }
    }
  },
  server: {
    port: 3002,
    strictPort: false,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@components': path.resolve(__dirname, './src/renderer/components'),
      '@pages': path.resolve(__dirname, './src/renderer/pages'),
      '@services': path.resolve(__dirname, './src/renderer/services'),
      '@utils': path.resolve(__dirname, './src/renderer/utils'),
      '@stores': path.resolve(__dirname, './src/renderer/stores'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  define: {
    __IS_DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    global: 'globalThis',
    'process.env': {}
  }
});