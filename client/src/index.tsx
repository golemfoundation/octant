// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';
import './wallect-connect-polyfill';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { WagmiProvider } from 'wagmi';

import env, { envViteKeys, envsAllowedToBeEmpty } from 'env';

import clientReactQuery from './api/clients/client-react-query';
import { wagmiConfig } from './api/clients/client-wagmi';
import App from './App';
import { RAINBOW_KIT_PROVIDER } from './constants/domElementsIds';

import '@rainbow-me/rainbowkit/styles.css';

import './sentry';

const root = document.getElementById('root')!;

if (window.location.hash) {
  const hashRoute = `${window.location.origin}/${window.location.hash}`;

  if (window.location.href.includes(hashRoute)) {
    window.location.replace(`${window.location.hash.replace('#', '')}`);
  }
}

(() => {
  const emptyEnvs = Object.entries(env).reduce(
    (acc, [key, value]) => (!value ? { ...acc, [envViteKeys[key]]: value } : acc),
    {},
  );
  const emptyEnvKeys = Object.keys(emptyEnvs);
  const requiredEnvKeys = emptyEnvKeys.filter(element => !envsAllowedToBeEmpty.includes(element));

  if (requiredEnvKeys.length > 0) {
    const errorMessage =
      'The application crashed because values for the following envs are missing';
    const emptyEnvKeysWithLinebreaksConsole = requiredEnvKeys.map(element => `\n-- ${element}`);
    const emptyEnvKeysWithLinebreaksUI = requiredEnvKeys.map(element => `<br />-- ${element}`);

    ReactDOM.createRoot(root).render(
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __html: `${errorMessage}: ${emptyEnvKeysWithLinebreaksUI}`,
        }}
      />,
    );
    throw new Error(`${errorMessage}: ${emptyEnvKeysWithLinebreaksConsole}`);
  }

  ReactDOM.createRoot(root).render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={clientReactQuery}>
        <RainbowKitProvider
          id={RAINBOW_KIT_PROVIDER}
          modalSize="compact"
          theme={lightTheme({
            accentColor: '#2d9b87',
            accentColorForeground: '#f8f8f8',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <ToastContainer
            position="top-center"
            style={{ overflowWrap: 'break-word', width: '350px' }}
            theme="dark"
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  );
})();
