import React, { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AllocationViewContainer from 'views/AllocationView/AllocationViewContainer';
import EarnView from 'views/EarnView/EarnView';
import MetricsView from 'views/MetricsView/MetricsView';
import ProposalsViewContainer from 'views/ProposalsView/ProposalsViewContainer';
import ProposalViewContainer from 'views/ProposalView/ProposalViewContainer';
import SettingsView from 'views/SettingsView/SettingsView';

import { ROOT_ROUTES } from './routes';

const RootRoutes = (): ReactElement => (
  <Routes>
    <Route element={<EarnView />} path={`${ROOT_ROUTES.earn.relative}/*`} />
    <Route element={<ProposalsViewContainer />} path={`${ROOT_ROUTES.proposals.relative}/*`} />
    <Route element={<AllocationViewContainer />} path={`${ROOT_ROUTES.allocation.relative}/*`} />
    <Route element={<MetricsView />} path={`${ROOT_ROUTES.metrics.relative}/*`} />
    <Route element={<SettingsView />} path={`${ROOT_ROUTES.settings.relative}/*`} />
    <Route element={<ProposalViewContainer />} path={`${ROOT_ROUTES.proposalWithId.relative}/*`} />
    <Route element={<Navigate to={ROOT_ROUTES.proposals.absolute} />} path="*" />
  </Routes>
);

export default RootRoutes;
