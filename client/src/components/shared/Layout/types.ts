import { ReactNode } from 'react';

export default interface LayoutProps {
  children?: ReactNode;
  classNameBody?: string;
  dataTest?: string;
  isAbsoluteHeaderPosition?: boolean;
  isHeaderVisible?: boolean;
  isLoading?: boolean;
  isNavigationVisible?: boolean;
  isSyncingInProgress?: boolean;
  navigationBottomSuffix?: ReactNode;
  showHeaderBlur?: boolean;
}
