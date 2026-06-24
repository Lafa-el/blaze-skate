import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom)\//,
            },
            {
              name: 'firebase-vendor',
              test: /node_modules\/(firebase|@firebase)\//,
            },
            {
              name: 'icons-vendor',
              test: /node_modules\/lucide-react\//,
            },
            {
              name: 'vendor',
              test: /node_modules\//,
            },
          ],
        },
      },
    },
  },
})
