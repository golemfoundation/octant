// eslint-disable-next-line no-restricted-syntax
import * as Sentry from '@sentry/react';

// import env from 'env';

Sentry.init({
  dsn: 'https://207392fdfee5b8348be75b27b53c0e82@o4506778713194496.ingest.sentry.io/4506778715881472',
  // TODO OCT-1525 enable browserTracingIntegration or remove this TODO.
  // integrations: [Sentry.browserTracingIntegration()],
  //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  // tracePropagationTargets: [
  //   env.serverEndpoint,
  //   ...env.ipfsGateways.split(','),
  // ],
  // Performance Monitoring
  // tracesSampleRate: 1.0,
  // Session Replay
});
