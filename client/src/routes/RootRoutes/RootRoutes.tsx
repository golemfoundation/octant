import React, { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import AllocationView from 'views/AllocationView/AllocationView';
import EarnView from 'views/EarnView/EarnView';
import MetricsView from 'views/MetricsView/MetricsView';
import ProposalsView from 'views/ProposalsView/ProposalsView';
import ProposalView from 'views/ProposalView/ProposalView';
import SettingsView from 'views/SettingsView/SettingsView';

import { ROOT_ROUTES } from './routes';

const RootRoutes = (): ReactElement => {
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();

  return (
    <Routes>
      {!isPreLaunch && (
        <>
          {!isProjectAdminMode && (
            <>
              <Route element={<AllocationView />} path={`${ROOT_ROUTES.allocation.relative}/*`} />
              <Route element={<MetricsView />} path={`${ROOT_ROUTES.metrics.relative}/*`} />
              <Route element={<ProposalsView />} path={`${ROOT_ROUTES.proposals.relative}/*`} />
              <Route
                element={<ProposalView />}
                path={`${ROOT_ROUTES.proposalWithAddress.relative}/*`}
              />
            </>
          )}
          <Route element={<SettingsView />} path={`${ROOT_ROUTES.settings.relative}/*`} />
        </>
      )}
      <Route element={<EarnView />} path={`${ROOT_ROUTES.earn.relative}/*`} />
      <Route
        element={
          <Navigate
            to={
              isPreLaunch || isProjectAdminMode
                ? ROOT_ROUTES.earn.absolute
                : ROOT_ROUTES.proposals.absolute
            }
          />
        }
        path="*"
      />
    </Routes>
  );
};

export default RootRoutes;
