// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';
import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { MetamaskStateProvider } from 'use-metamask';

import clientApollo from './api/clients/client-apollo';
import clientReactQuery from './api/clients/client-react-query';
import AppContainer from './App/AppContainer';
import store from './store';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <Provider store={store}>
    <ApolloProvider client={clientApollo}>
      <QueryClientProvider client={clientReactQuery}>
        <HashRouter>
          <MetamaskStateProvider>
            <AppContainer />
          </MetamaskStateProvider>
        </HashRouter>
        <ToastContainer
          position="top-center"
          style={{ overflowWrap: 'break-word', width: '350px' }}
          theme="dark"
        />
      </QueryClientProvider>
    </ApolloProvider>
  </Provider>,
);
