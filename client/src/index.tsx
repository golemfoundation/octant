// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';
import { ApolloProvider } from '@apollo/client';
import { Web3Modal } from '@web3modal/react';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from 'react-query';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';

import clientApollo from './api/clients/client-apollo';
import { ethereumClient } from './api/clients/client-ethereum';
import clientReactQuery from './api/clients/client-react-query';
import { wagmiClient } from './api/clients/client-wagmi';
import App from './App/App';
import { PROJECT_ID } from './constants/walletConnect';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <Fragment>
    <WagmiConfig client={wagmiClient}>
      <ApolloProvider client={clientApollo}>
        <QueryClientProvider client={clientReactQuery}>
          <HashRouter>
            <App />
          </HashRouter>
          <ToastContainer
            position="top-center"
            style={{ overflowWrap: 'break-word', width: '350px' }}
            theme="dark"
          />
        </QueryClientProvider>
      </ApolloProvider>
    </WagmiConfig>
    <Web3Modal ethereumClient={ethereumClient} projectId={PROJECT_ID} />
  </Fragment>,
);
