import React, { Fragment, FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import env from 'env';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import AllocationView from 'views/AllocationView/AllocationView';
import EarnView from 'views/EarnView/EarnView';
import HomeView from 'views/HomeView/HomeView';
import MetricsView from 'views/MetricsView/MetricsView';
import PlaygroundView from 'views/PlaygroundView/PlaygroundView';
import ProjectsView from 'views/ProjectsView/ProjectsView';
import ProjectView from 'views/ProjectView/ProjectView';
import SettingsView from 'views/SettingsView/SettingsView';
import SyncView from 'views/SyncView/SyncView';

import { ROOT_ROUTES } from './routes';
import RootRoutesProps, { ProtectedProps } from './types';

const Protected: FC<ProtectedProps> = ({ children, isSyncingInProgress }) =>
  isSyncingInProgress ? <SyncView /> : children;

const RootRoutes: FC<RootRoutesProps> = props => {
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  return (
    <Routes>
      {!isPreLaunch && (
        <>
          {!isProjectAdminMode && (
            <>
              {!isPatronMode && (
                <Route
                  element={
                    <Protected {...props}>
                      <AllocationView />
                    </Protected>
                  }
                  path={`${ROOT_ROUTES.allocation.relative}/*`}
                />
              )}
              <Route
                element={
                  <Protected {...props}>
                    <HomeView />
                  </Protected>
                }
                path={`${ROOT_ROUTES.home.relative}/*`}
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
                    <ProjectsView />
                  </Protected>
                }
                path={`${ROOT_ROUTES.projects.relative}/*`}
              />
              <Route
                element={
                  <Protected {...props}>
                    <ProjectView />
                  </Protected>
                }
                path={`${ROOT_ROUTES.projectWithAddress.relative}/*`}
              />
            </>
          )}
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
      {(window.Cypress || env.network === 'Local') && (
        <Route
          element={
            <Protected {...props}>
              <PlaygroundView />
            </Protected>
          }
          path={`${ROOT_ROUTES.playground.relative}/*`}
        />
      )}
      <Route
        element={
          <Navigate
            to={
              isPreLaunch || isProjectAdminMode
                ? ROOT_ROUTES.earn.absolute
                : ROOT_ROUTES.projects.absolute
            }
          />
        }
        path="*"
      />
    </Routes>
  );
};

export default RootRoutes;
