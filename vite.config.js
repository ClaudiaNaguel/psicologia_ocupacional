import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      },
      // Agrega esto para que dompurify se incluya en el bundle
      external: []  // No externalizar dompurify (debe incluirse)
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // Agrega esto para optimizar la resolución de dependencias
  optimizeDeps: {
    include: ['dompurify']
  }
})