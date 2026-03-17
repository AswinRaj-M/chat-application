import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'global': 'window',
        'process.env': {},
    },
    resolve: {
        alias: {
            process: 'process/browser',
            stream: 'stream-browserify',
            zlib: 'browserify-zlib',
            util: path.resolve(__dirname, 'node_modules/util/util.js'),
            buffer: 'buffer',
        },
    },
    optimizeDeps: {
        include: ['buffer', 'process', 'util', 'stream-browserify'],
    },
})
