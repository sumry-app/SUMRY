import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Keep manual chunking minimal. Splitting a library into its own chunk
    // without its transitive deps can produce a circular chunk-initialization
    // order that throws "Cannot access 'X' before initialization" at load, in
    // production only. That previously happened here by splitting recharts
    // away from its d3-* packages, and it broke the entire deployed site.
    // Verify a production build before adding entries below.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // react/react-dom only: self-contained, no cross-chunk circularity
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'recharts',
      'lucide-react',
      'zustand',
      'date-fns'
    ],
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
})
