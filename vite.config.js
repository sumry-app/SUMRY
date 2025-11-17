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
    // Target modern browsers for smaller builds
    target: 'es2015',
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Charts library
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Utilities
          if (id.includes('node_modules/date-fns') || 
              id.includes('node_modules/zustand') || 
              id.includes('node_modules/axios')) {
            return 'vendor-utils';
          }
          // PDF generation (if used)
          if (id.includes('jspdf')) {
            return 'vendor-pdf';
          }
          // UI utilities
          if (id.includes('class-variance-authority') || 
              id.includes('clsx') || 
              id.includes('tailwind-merge')) {
            return 'vendor-ui';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit (we're splitting properly now)
    chunkSizeWarningLimit: 500,
    
    // Source maps for production debugging (disabled for smaller builds)
    sourcemap: false,
    
    // Asset inline limit (smaller assets will be inlined as base64)
    assetsInlineLimit: 4096,
  },
  
  // Optimize dependencies
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
  
  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
})
