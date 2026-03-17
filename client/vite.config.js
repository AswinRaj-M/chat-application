import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'global': 'window',
    },
    resolve: {
        alias: {
            process: 'process/browser',
            util: 'util',
            buffer: 'buffer',
            stream: 'stream-browserify',
        },
    },
})
