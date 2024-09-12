import React, { ReactNode, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import env from 'env';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
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

import { ROOT_ROUTES } from './routes';

const RootRoutes = (): ReactNode => {
  const { isDesktop } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();
  const { pathname } = useLocation();

  const lastSeenPathRef = useRef(ROOT_ROUTES.home.absolute);

  useEffect(() => {
    if (
      pathname === ROOT_ROUTES.settings.absolute ||
      pathname === ROOT_ROUTES.allocation.absolute
    ) {
      return;
    }
    lastSeenPathRef.current = pathname;
  }, [pathname]);

  return (
    <Routes>
      {!isPreLaunch && (
        <>
          {!isProjectAdminMode && (
            <>
              {!isPatronMode && (
                <Route
                  element={
                    isDesktop ? <Navigate to={lastSeenPathRef.current} /> : <AllocationView />
                  }
                  path={`${ROOT_ROUTES.allocation.relative}/*`}
                />
              )}
              <Route element={<HomeView />} path={`${ROOT_ROUTES.home.relative}/*`} />
              <Route element={<MetricsView />} path={`${ROOT_ROUTES.metrics.relative}/*`} />
              <Route element={<ProjectsView />} path={`${ROOT_ROUTES.projects.relative}/*`} />
              <Route
                element={<ProjectView />}
                path={`${ROOT_ROUTES.projectWithAddress.relative}/*`}
              />
            </>
          )}
          <Route
            element={isDesktop ? <Navigate to={lastSeenPathRef.current} /> : <SettingsView />}
            path={`${ROOT_ROUTES.settings.relative}/*`}
          />
        </>
      )}
      <Route element={<EarnView />} path={`${ROOT_ROUTES.earn.relative}/*`} />
      {(window.Cypress || env.network === 'Local') && (
        <Route element={<PlaygroundView />} path={`${ROOT_ROUTES.playground.relative}/*`} />
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
