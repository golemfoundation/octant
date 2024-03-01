// eslint-disable-next-line no-restricted-syntax
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://207392fdfee5b8348be75b27b53c0e82@o4506778713194496.ingest.sentry.io/4506778715881472',
  integrations: [Sentry.browserTracingIntegration()],
  //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    process.env.VITE_SERVER_ENDPOINT as string,
    ...process.env.VITE_IPFS_GATEWAYS!.split(','),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
});
