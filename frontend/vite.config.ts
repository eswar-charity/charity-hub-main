import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react'
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor-redux'
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'vendor-form'
            if (id.includes('@tanstack')) return 'vendor-query'
            if (id.includes('lucide-react') || id.includes('clsx')) return 'vendor-ui'
            if (id.includes('axios')) return 'vendor-http'
            if (id.includes('@supabase')) return 'vendor-supa'
          }
        },
      },
    },
  },
})
