import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks for better caching
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'ui-vendor'
          }
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify CSS
    cssMinify: true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Server configuration
  server: {
    // Enable HMR
    hmr: true,
    // Open browser on start
    open: false,
  },
})
