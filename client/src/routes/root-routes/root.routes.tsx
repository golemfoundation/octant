import { Navigate, Route, Routes } from 'react-router-dom';
import React, { ReactElement } from 'react';

import AllocationView from 'views/allocation-view/allocation.view';
import DepositView from 'views/deposit-view/deposit.view';
import EarnView from 'views/earn-view/earn.view';
import MetricsView from 'views/metrics-view/metrics.view';
import ProposalsView from 'views/proposals-view/proposal.view';
import SettingsView from 'views/settings-view/settings.view';

import { ROOT_ROUTES } from './routes';

const RootRoutes = (): ReactElement => (
  <Routes>
    <Route element={<EarnView />} path={`${ROOT_ROUTES.earn.relative}/*`} />
    <Route element={<ProposalsView />} path={`${ROOT_ROUTES.proposals.relative}/*`} />
    <Route element={<DepositView />} path={`${ROOT_ROUTES.deposit.relative}/*`} />
    <Route element={<AllocationView />} path={`${ROOT_ROUTES.allocation.relative}/*`} />
    <Route element={<MetricsView />} path={`${ROOT_ROUTES.metrics.relative}/*`} />
    <Route element={<SettingsView />} path={`${ROOT_ROUTES.settings.relative}/*`} />
    <Route element={<Navigate to={ROOT_ROUTES.proposals.absolute} />} path="*" />
  </Routes>
);

export default RootRoutes;
