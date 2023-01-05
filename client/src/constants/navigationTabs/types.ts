import { ReactNode } from 'react';

import { Path } from 'utils/routing';
import { SvgImageConfig } from 'components/core/Svg/types';

export interface NavigationTab {
  icon: SvgImageConfig;
  iconWrapped?: ReactNode;
  isActive?: boolean;
  label: string;
  to: Path['absolute'];
}
