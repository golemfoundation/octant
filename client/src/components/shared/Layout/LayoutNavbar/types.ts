import { ReactNode } from 'react';

import { NavigationTab } from 'constants/navigationTabs/types';

export default interface LayoutNavbarProps {
  navigationBottomSuffix: ReactNode;
  tabs: (Omit<NavigationTab, 'isActive'> & { isActive: boolean })[];
}
