/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
/* eslint-enable import/no-extraneous-dependencies */
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, _config) {
      on(
        'file:preprocessor',
        vitePreprocessor({
          resolve: {
            alias: {
              cypress: path.resolve(__dirname, 'cypress'),
              src: path.resolve(__dirname, 'src'),
            },
          },
        }),
      );
    },
    supportFile: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
});
