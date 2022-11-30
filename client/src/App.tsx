import { HashRouter } from 'react-router-dom';
import { MetamaskStateProvider } from 'use-metamask';
import { QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import React, { ReactElement } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import reactQueryClient from 'api/react-query';

import RootRoutes from './routes/root-routes/root.routes';

import './styles/index.scss';

const App = (): ReactElement => (
  <QueryClientProvider client={reactQueryClient}>
    <HashRouter>
      <MetamaskStateProvider>
        <RootRoutes />
      </MetamaskStateProvider>
    </HashRouter>
    <ToastContainer
      position="top-center"
      style={{ overflowWrap: 'break-word', width: '350px' }}
      theme="dark"
    />
  </QueryClientProvider>
);

export default App;
