import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AllocationViewContainer from 'views/AllocationView/AllocationViewContainer';
import EarnView from 'views/EarnView/EarnView';
import MetricsView from 'views/MetricsView/MetricsView';
import OnboardingViewContainer from 'views/OnboardingView/OnboardingViewContainer';
import ProposalsViewContainer from 'views/ProposalsView/ProposalsViewContainer';
import ProposalViewContainer from 'views/ProposalView/ProposalViewContainer';
import SettingsViewContainer from 'views/SettingsView/SettingsViewContainer';

import { ROOT_ROUTES } from './routes';
import { RootRoutesProps } from './types';

const RootRoutes: FC<RootRoutesProps> = ({ isOnboardingDone }) => {
  if (!isOnboardingDone) {
    return (
      <Routes>
        <Route
          element={<OnboardingViewContainer />}
          path={`${ROOT_ROUTES.onboarding.relative}/*`}
        />
        <Route element={<Navigate to={ROOT_ROUTES.onboarding.absolute} />} path="*" />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AllocationViewContainer />} path={`${ROOT_ROUTES.allocation.relative}/*`} />
      <Route element={<EarnView />} path={`${ROOT_ROUTES.earn.relative}/*`} />
      <Route element={<MetricsView />} path={`${ROOT_ROUTES.metrics.relative}/*`} />
      <Route element={<ProposalsViewContainer />} path={`${ROOT_ROUTES.proposals.relative}/*`} />
      <Route
        element={<ProposalViewContainer />}
        path={`${ROOT_ROUTES.proposalWithAddress.relative}/*`}
      />
      <Route element={<SettingsViewContainer />} path={`${ROOT_ROUTES.settings.relative}/*`} />
      <Route element={<Navigate to={ROOT_ROUTES.proposals.absolute} />} path="*" />
    </Routes>
  );
};

export default RootRoutes;
