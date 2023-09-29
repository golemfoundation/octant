import React, { Fragment, FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import AllocationView from 'views/AllocationView/AllocationView';
import EarnView from 'views/EarnView/EarnView';
import MetricsView from 'views/MetricsView/MetricsView';
import ProposalsView from 'views/ProposalsView/ProposalsView';
import ProposalView from 'views/ProposalView/ProposalView';
import SettingsView from 'views/SettingsView/SettingsView';
import SyncView from 'views/SyncView/SyncView';

import { ROOT_ROUTES } from './routes';
import RootRoutesProps, { ProtectedProps } from './types';

const Protected: FC<ProtectedProps> = ({ children, isSyncingInProgress }) =>
  isSyncingInProgress ? <SyncView /> : children;

const RootRoutes: FC<RootRoutesProps> = props => {
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);

  return (
    <Routes>
      {!isPreLaunch && (
        <>
          <Route
            element={
              <Protected {...props}>
                <AllocationView />
              </Protected>
            }
            path={`${ROOT_ROUTES.allocation.relative}/*`}
          />
          <Route
            element={
              <Protected {...props}>
                <MetricsView />
              </Protected>
            }
            path={`${ROOT_ROUTES.metrics.relative}/*`}
          />
          <Route
            element={
              <Protected {...props}>
                <ProposalsView />
              </Protected>
            }
            path={`${ROOT_ROUTES.proposals.relative}/*`}
          />
          <Route
            element={
              <Protected {...props}>
                <ProposalView />
              </Protected>
            }
            path={`${ROOT_ROUTES.proposalWithAddress.relative}/*`}
          />
          <Route
            element={
              <Protected {...props}>
                <SettingsView />
              </Protected>
            }
            path={`${ROOT_ROUTES.settings.relative}/*`}
          />
        </>
      )}
      <Route
        element={
          <Protected {...props}>
            <EarnView />
          </Protected>
        }
        path={`${ROOT_ROUTES.earn.relative}/*`}
      />
      <Route
        element={
          <Navigate to={isPreLaunch ? ROOT_ROUTES.earn.absolute : ROOT_ROUTES.proposals.absolute} />
        }
        path="*"
      />
    </Routes>
  );
};

export default RootRoutes;
