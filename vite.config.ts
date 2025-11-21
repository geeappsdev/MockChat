
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANT: Replace 'your-repo-name' with the actual name of your GitHub repository.
  // For example, if your repo URL is https://github.com/user/my-app, set base to '/my-app/'.
  base: '/your-repo-name/', 
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
