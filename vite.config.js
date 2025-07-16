import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/is-this-a-vessel-app/',
  plugins: [react()],
})
