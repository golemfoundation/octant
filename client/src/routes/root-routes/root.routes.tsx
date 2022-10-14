import { Navigate, Route, Routes } from 'react-router-dom';
import React, { ReactElement } from 'react';

import MainLayout from 'layouts/main-layout/main.layout';
import ProposalsView from 'views/proposals-view/proposals.view';
import StatsView from 'views/stats-view/stats.view';

import { ROOT_ROUTES } from './routes';

const RootRoutes = (): ReactElement => (
  <MainLayout>
    <Routes>
      <Route element={<ProposalsView />} path={`${ROOT_ROUTES.proposals.relative}/*`} />
      <Route element={<StatsView />} path={`${ROOT_ROUTES.stats.relative}/*`} />
      <Route element={<Navigate to={ROOT_ROUTES.proposals.absolute} />} path="*" />
    </Routes>
  </MainLayout>
);

export default RootRoutes;
