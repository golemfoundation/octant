import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { octantInverted } from 'svg/logo';
import { allocate, earn, metrics, project, settings } from 'svg/navigation';

import { NavigationTab } from './types';

export const navigationTabs: NavigationTab[] = [
  {
    icon: octantInverted,
    label: 'Home',
    to: ROOT_ROUTES.home.absolute,
  },
  {
    icon: project,
    label: 'Projects',
    to: ROOT_ROUTES.projects.absolute,
  },
  {
    icon: allocate,
    label: 'Allocate',
    to: ROOT_ROUTES.allocation.absolute,
  },
  {
    icon: metrics,
    label: 'Metrics',
    to: ROOT_ROUTES.metrics.absolute,
  },
  {
    icon: settings,
    label: 'Settings',
    to: ROOT_ROUTES.settings.absolute,
  },
];

export const adminNavigationTabs: NavigationTab[] = [
  {
    icon: earn,
    label: 'Home',
    to: ROOT_ROUTES.earn.absolute,
  },
  {
    icon: settings,
    label: 'Settings',
    to: ROOT_ROUTES.settings.absolute,
  },
];

export const patronNavigationTabs: NavigationTab[] = [
  {
    icon: project,
    label: 'Projects',
    to: ROOT_ROUTES.projects.absolute,
  },
  {
    icon: earn,
    label: 'Earn',
    to: ROOT_ROUTES.earn.absolute,
  },
  {
    icon: metrics,
    label: 'Metrics',
    to: ROOT_ROUTES.metrics.absolute,
  },
  {
    icon: settings,
    label: 'Settings',
    to: ROOT_ROUTES.settings.absolute,
  },
];
