import { HashRouter } from 'react-router-dom';
import { MetamaskStateProvider } from 'use-metamask';
import React, { ReactElement } from 'react';

import RootRoutes from './routes/root-routes/root.routes';

import './styles/index.scss';

const App = (): ReactElement => (
  <HashRouter>
    <MetamaskStateProvider>
      <RootRoutes />
    </MetamaskStateProvider>
  </HashRouter>
);

export default App;
