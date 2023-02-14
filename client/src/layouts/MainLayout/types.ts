import { ReactNode } from 'react';

import { NavigationTab } from 'constants/navigationTabs/types';
import { AllocationsStore } from 'store/models/allocations/types';

export interface OwnProps {
  children?: ReactNode;
  classNameBody?: string;
  isHeaderVisible?: boolean;
  isLoading?: boolean;
  isNavigationVisible?: boolean;
  landscapeImage?: ReactNode;
  navigationBottomSuffix?: ReactNode;
  navigationTabs?: NavigationTab[];
}

export interface StateProps extends OwnProps {
  allocations: NonNullable<AllocationsStore>;
}

export default interface MainLayoutProps extends StateProps {}
