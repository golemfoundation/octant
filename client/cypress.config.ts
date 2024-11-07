// import { configureSynpressForMetaMask } from '@synthetixio/synpress/cypress';
import vitePreprocessor from 'cypress-vite';
import path from 'path';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.OCTANT_BASE_URL || 'http://localhost:5173',
    defaultCommandTimeout: 120 * 1000,
    setupNodeEvents(on, config) {
      // eslint-disable-next-line no-param-reassign
      config.env = { ...config.env, CI: process.env.CI };
      on(
        'file:preprocessor',
        vitePreprocessor({
          resolve: {
            alias: {
              cypress: path.resolve(import.meta.dirname, 'cypress'),
              src: path.resolve(import.meta.dirname, 'src'),
            },
          },
        }),
      );
      // TODO: handle Metamask
      // return configureSynpressForMetaMask(on, config);
      return config;
    },
    supportFile: 'cypress/support/e2e.ts',
    numTestsKeptInMemory: 4,
    video: true,
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
});
