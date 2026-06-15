import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['events', 'util', 'buffer', 'stream', 'string_decoder', 'crypto', 'path', 'http', 'https', 'os', 'zlib'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  build: {
    rollupOptions: {
      external: ['@usedapp/core']
    },
    rolldownOptions: {
      external: ['@usedapp/core']
    }
  }
})
