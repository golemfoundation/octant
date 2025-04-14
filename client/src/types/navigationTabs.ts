import { SvgImageConfig } from 'components/ui/Svg/types';
import { Path } from 'utils/routing';

export interface NavigationTab {
  icon: SvgImageConfig;
  id?: string;
  isActive: boolean;
  isBigIcon?: boolean;
  isDisabled: boolean;
  key: string;
  label: string;
  to: Path['absolute'];
}
