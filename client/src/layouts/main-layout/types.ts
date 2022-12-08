import { ReactNode } from 'react';

import { NavigationTab } from 'constants/navigationTabs/types';

export default interface MainLayoutProps {
  children?: ReactNode;
  classNameBody?: string;
  isHeaderVisible?: boolean;
  isLoading?: boolean;
  landscapeImage?: ReactNode;
  navigationBottomSuffix?: ReactNode;
  navigationTabs?: NavigationTab[];
}
