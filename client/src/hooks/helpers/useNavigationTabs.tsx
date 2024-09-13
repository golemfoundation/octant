// import useIsPatronMode from 'hooks/queries/useIsPatronMode';
// import useIsProjectAdminMode from './useIsProjectAdminMode';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useUserTOS from 'hooks/queries/useUserTOS';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { octantInverted } from 'svg/logo';
import { allocate, metrics, project, settings } from 'svg/navigation';
import { NavigationTab } from 'types/navigationTabs';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import useIsProjectAdminMode from './useIsProjectAdminMode';

const useNavigationTabs = (isTopBar?: boolean): NavigationTab[] => {
  //   TODO: project admin mode support -> https://linear.app/golemfoundation/issue/OCT-1892/layout-project-admin-mode
  //   const isProjectAdminMode = useIsProjectAdminMode();

  //   TODO: patron mode support -> https://linear.app/golemfoundation/issue/OCT-1893/layout-patron-mode
  //   const { data: isPatronMode } = useIsPatronMode();

  const { t } = useTranslation('translation', { keyPrefix: 'layout.navigationTabs' });
  const { isConnected } = useAccount();
  const { data: isUserTOSAccepted } = useUserTOS();
  const { pathname } = useLocation();
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const navigationTabs: NavigationTab[] = [
    {
      icon: octantInverted,
      isActive: ROOT_ROUTES.home.absolute === pathname,
      key: 'home',
      label: t('home'),
      to: ROOT_ROUTES.home.absolute,
    },
    {
      icon: project,
      isActive:
        ROOT_ROUTES.projects.absolute === pathname ||
        pathname.includes(`${ROOT_ROUTES.project.absolute}/`),
      key: 'projects',
      label: t('projects'),
      to: ROOT_ROUTES.projects.absolute,
    },
    {
      icon: allocate,
      isActive: ROOT_ROUTES.allocation.absolute === pathname,
      key: 'allocate',
      label: t('allocate'),
      to: ROOT_ROUTES.allocation.absolute,
    },
    {
      icon: metrics,
      isActive: ROOT_ROUTES.metrics.absolute === pathname,
      key: 'metrics',
      label: t('metrics'),
      to: ROOT_ROUTES.metrics.absolute,
    },
    {
      icon: settings,
      isActive: ROOT_ROUTES.settings.absolute === pathname,
      key: 'settings',
      label: t('settings'),
      to: ROOT_ROUTES.settings.absolute,
    },
  ].map(tab => ({
    ...tab,
    isDisabled: (isConnected && !isUserTOSAccepted) || tab.key === 'home' ? false : isPreLaunch,
  }));

  if (isTopBar) {
    return navigationTabs.filter(({ key }) => key !== 'allocate' && key !== 'settings');
  }

  if (isPatronMode || isProjectAdminMode) {
    return navigationTabs.filter(({ key }) => key !== 'allocate');
  }

  return navigationTabs;
};

export default useNavigationTabs;
