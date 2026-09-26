import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          saudi: path.resolve(__dirname, 'saudi.html'),
          oman: path.resolve(__dirname, 'oman.html'),
          kuwait: path.resolve(__dirname, 'kuwait.html'),
          uae: path.resolve(__dirname, 'uae.html'),
          qatarBahrain: path.resolve(__dirname, 'qatar-bahrain.html'),
          bangladesh: path.resolve(__dirname, 'bangladesh.html'),
          reseller: path.resolve(__dirname, 'reseller.html'),
          tutorial: path.resolve(__dirname, 'tutorial.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
