/* eslint-disable import/no-extraneous-dependencies */
import synpressPlugins from '@synthetixio/synpress/plugins';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
/* eslint-enable import/no-extraneous-dependencies */
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: process.env.OCTANT_BASE_URL || 'http://localhost:5173',
    setupNodeEvents(on, config) {
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

      synpressPlugins(on, config);
      return config;
    },
    supportFile: 'cypress/support/index.ts',
  },
  viewportHeight: 1080,
  viewportWidth: 1920,
});
