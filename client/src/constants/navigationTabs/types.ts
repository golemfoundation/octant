import { SvgImageConfig } from 'components/core/Svg/types';
import { Path } from 'utils/routing';

export interface NavigationTab {
  icon: SvgImageConfig;
  isActive?: boolean;
  label: string;
  to: Path['absolute'];
}
