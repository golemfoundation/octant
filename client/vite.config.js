/* eslint-disable import/no-extraneous-dependencies */
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import i18n from 'i18next';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import viteCompression from 'vite-plugin-compression';
import htmlPlugin from 'vite-plugin-html-config';

import translationEN from './src/locales/en/translation.json';

const path = require('path');

/* eslint-enable import/no-extraneous-dependencies */

i18n.init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  lng: 'en',
  resources: {
    en: {
      translation: translationEN,
    },
  },
  returnNull: false,
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isStaging = mode === 'staging';
  const localIdentName = isProduction ? '[hash:base64:5]' : '[name]__[local]--[hash:base64:5]';
  const base = '/';

  const plugins = [
    react(),
    splitVendorChunkPlugin(),
    viteCompression(),
    htmlPlugin({
      metas: [
        { content: i18n.t('meta.description'), name: 'og:description' },
        { content: i18n.t('meta.description'), name: 'description' },
        { content: `${base}images/og-image.png`, name: 'og:image' },
      ],
    }),
  ];
  if (isStaging) {
    plugins.push(
      visualizer({
        filename: 'bundleAnalysis.html',
      }),
    );
  }
  if (isProduction && process.env.VITE_SENTRY_AUTH_TOKEN) {
    plugins.push(
      sentryVitePlugin({
        authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
        org: 'golem-foundation',
        project: 'octant-client-production',
      }),
    );
  }

  return {
    base,
    build: {
      sourcemap: true,
    },
    css: {
      modules: {
        generateScopedName: localIdentName,
      },
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
    plugins,
    resolve: {
      alias: {
        api: path.resolve(__dirname, 'src/api'),
        assets: path.resolve(__dirname, 'src/assets'),
        components: path.resolve(__dirname, 'src/components'),
        constants: path.resolve(__dirname, 'src/constants'),
        context: path.resolve(__dirname, 'src/context'),
        env: path.resolve(__dirname, 'src/env'),
        gql: path.resolve(__dirname, 'src/gql'),
        hooks: path.resolve(__dirname, 'src/hooks'),
        i18n: path.resolve(__dirname, 'src/i18n'),
        layouts: path.resolve(__dirname, 'src/layouts'),
        locales: path.resolve(__dirname, 'src/locales'),
        mocks: path.resolve(__dirname, 'src/mocks'),
        routes: path.resolve(__dirname, 'src/routes'),
        services: path.resolve(__dirname, 'src/services'),
        store: path.resolve(__dirname, 'src/store'),
        styles: path.resolve(__dirname, 'src/styles'),
        svg: path.resolve(__dirname, 'src/svg'),
        types: path.resolve(__dirname, 'src/types'),
        utils: path.resolve(__dirname, 'src/utils'),
        views: path.resolve(__dirname, 'src/views'),
      },
    },
  };
});
