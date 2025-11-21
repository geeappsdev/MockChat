
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // This must match the subfolder name of your GitHub Pages deployment.
  // e.g., for https://geeappsdev.github.io/MockChat/, the base is '/MockChat/'.
  base: '/MockChat/', 
  plugins: [react()],
  server: {
    proxy: {
      // This forwards any request starting with /google-api to Google's servers
      '/google-api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-api/, ''),
        secure: false,
      },
    },
  },
});
