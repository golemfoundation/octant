// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';
import { HashRouter } from 'react-router-dom';
import { MetamaskStateProvider } from 'use-metamask';
import { Provider } from 'react-redux';
import { QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import React from 'react';
import ReactDOM from 'react-dom/client';

import AppContainer from './App/AppContainer';
import reactQueryClient from './api/react-query';
import store from './store';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <Provider store={store}>
    <QueryClientProvider client={reactQueryClient}>
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
  </Provider>,
);
