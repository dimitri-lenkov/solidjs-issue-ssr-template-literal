import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
    server: {
        hmr: {
            port: 24678
        }
    },
    plugins: [
        solid({ ssr: true })
    ]
})
