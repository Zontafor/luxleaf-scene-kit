import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
export default {
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 4390,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
  optimizeDeps: { exclude: ['@react-three/fiber'] },
}
