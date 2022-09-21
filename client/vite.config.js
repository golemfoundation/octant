/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const path = require('path');
/* eslint-enable import/no-extraneous-dependencies */

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData:
          '/* auto injected code > */ @import "./src/styles/_main.scss"; /* auto injected code < */',
        sassOptions: {
          outputStyle: 'compressed',
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      api: path.resolve(__dirname, 'src/api'),
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      constants: path.resolve(__dirname, 'src/constants'),
      context: path.resolve(__dirname, 'src/context'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      services: path.resolve(__dirname, 'src/services'),
      styles: path.resolve(__dirname, 'src/styles'),
      svg: path.resolve(__dirname, 'src/svg'),
      types: path.resolve(__dirname, 'src/types'),
      utils: path.resolve(__dirname, 'src/utils'),
      views: path.resolve(__dirname, 'src/views'),
    },
  },
  server: {
    proxy: {
      // Proxying websockets or socket.io
      '/apiws': {
        target: 'ws://127.0.0.1:5001',
        ws: true,
      },

      '/players': {
        target: 'http://127.0.0.1:5001',
      },

      '/register': {
        target: 'http://127.0.0.1:5001',
      },

      '/timestamp': {
        target: 'http://127.0.0.1:5001',
      },

      '/withdraw': {
        target: 'http://127.0.0.1:5001',
      },
    },
  },
});
