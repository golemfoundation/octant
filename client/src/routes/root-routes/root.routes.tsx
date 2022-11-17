import { Navigate, Route, Routes } from 'react-router-dom';
import React, { ReactElement } from 'react';

import DepositView from 'views/deposit-view/deposit.view';
import EarnView from 'views/earn-view/earn.view';
import MainLayout from 'layouts/main-layout/main.layout';
import MetricsView from 'views/metrics-view/metrics.view';
import ProjectsView from 'views/projects-view/projects.view';
import SettingsView from 'views/settings-view/settings.view';

import { ROOT_ROUTES } from './routes';

const RootRoutes = (): ReactElement => (
  <MainLayout>
    <Routes>
      <Route element={<EarnView />} path={`${ROOT_ROUTES.earn.relative}/*`} />
      <Route element={<ProjectsView />} path={`${ROOT_ROUTES.projects.relative}/*`} />
      <Route element={<DepositView />} path={`${ROOT_ROUTES.deposits.relative}/*`} />
      <Route element={<MetricsView />} path={`${ROOT_ROUTES.metrics.relative}/*`} />
      <Route element={<SettingsView />} path={`${ROOT_ROUTES.settings.relative}/*`} />
      <Route element={<Navigate to={ROOT_ROUTES.projects.absolute} />} path="*" />
    </Routes>
  </MainLayout>
);

export default RootRoutes;
