import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('pusher-js')) return 'vendor-pusher';
            if (id.includes('react-toastify')) return 'vendor-notifications';
            if (id.includes('axios') || id.includes('react-router-dom') || id.includes('react-dom')) return 'vendor-core';
            return 'vendor-utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
