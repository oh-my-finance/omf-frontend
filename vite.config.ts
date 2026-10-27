import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 배포처럼 같은 origin의 /api를 쓰려면 API_PROXY_TARGET(예: http://localhost:8080)을 주고
// VITE_API_BASE_URL=/api로 띄운다. e2e(omf-e2e)는 이 방식으로 BASE_URL 하나만 받는다.
const apiProxy = process.env.API_PROXY_TARGET
  ? { '/api': { target: process.env.API_PROXY_TARGET, changeOrigin: true } }
  : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
