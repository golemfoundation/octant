import { HashRouter } from 'react-router-dom';
import { MetamaskStateProvider } from 'use-metamask';
import { QueryClientProvider } from 'react-query';
import React, { ReactElement } from 'react';

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
  </QueryClientProvider>
);

export default App;
