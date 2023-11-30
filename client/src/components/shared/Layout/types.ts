import { ReactNode } from 'react';

import { NavigationTab } from 'constants/navigationTabs/types';

export default interface LayoutProps {
  children?: ReactNode;
  classNameBody?: string;
  dataTest?: string;
  isHeaderVisible?: boolean;
  isLoading?: boolean;
  isNavigationVisible?: boolean;
  navigationBottomSuffix?: ReactNode;
  navigationTabs?: NavigationTab[];
}
