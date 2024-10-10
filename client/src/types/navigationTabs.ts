import { SvgImageConfig } from 'components/ui/Svg/types';
import { Path } from 'utils/routing';

export interface NavigationTab {
  icon: SvgImageConfig;
  isActive: boolean;
  isDisabled: boolean;
  key: string;
  label: string;
  to: Path['absolute'];
}
