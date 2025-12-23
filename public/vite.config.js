import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
const certPath = path.resolve(__dirname, '.cert/cert.pem')
const keyPath = path.resolve(__dirname, '.cert/key.pem')
const useHttps = false // fs.existsSync(certPath) && fs.existsSync(keyPath)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    https: useHttps ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    } : false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})