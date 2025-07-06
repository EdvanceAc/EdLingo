import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // AI/ML libraries - these are typically large
          if (id.includes('@google/generative-ai') || id.includes('@google/genai')) {
            return 'ai-google';
          }
          
          if (id.includes('@huggingface/transformers')) {
            return 'ai-huggingface';
          }
          

          
          // UI component libraries
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
          
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }
          
          // Router
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // Tailwind and styling
          if (id.includes('tailwind') || id.includes('clsx') || id.includes('class-variance-authority')) {
            return 'styling';
          }
          
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
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
    'process.env': {},
    'process.stdout': '{ isTTY: false }',
    'process.stderr': '{ isTTY: false }'
  },
  optimizeDeps: {
    include: ['googleapis', 'google-auth-library']
  }
});