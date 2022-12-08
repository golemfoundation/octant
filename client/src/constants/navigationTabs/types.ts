import { Path } from 'utils/routing';
import { SvgImageConfig } from 'components/core/svg/types';

export interface NavigationTab {
  icon: SvgImageConfig;
  isActive?: boolean;
  label: string;
  to: Path['absolute'];
}
