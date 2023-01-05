import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { allocate, earn, metrics, proposals, settings } from 'svg/navigation';

import { NavigationTab } from './types';

export const navigationTabs: NavigationTab[] = [
  {
    icon: proposals,
    label: 'Projects',
    to: ROOT_ROUTES.proposals.absolute,
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
    icon: earn,
    label: 'Earn',
    to: ROOT_ROUTES.earn.absolute,
  },
  {
    icon: settings,
    label: 'Settings',
    to: ROOT_ROUTES.settings.absolute,
  },
];
