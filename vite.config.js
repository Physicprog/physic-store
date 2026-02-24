import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT : remplacez 'digital-store' par le nom exact de votre repo GitHub
// ex: si votre repo est github.com/monpseudo/ma-boutique → base: '/ma-boutique/'
export default defineConfig({
  plugins: [react()],
  base: '/physic-store/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
