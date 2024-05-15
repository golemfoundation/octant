import { ReactNode } from 'react';

import DoubleValueProps from 'components/ui/DoubleValue/types';
import { SvgImageConfig } from 'components/ui/Svg/types';
import TooltipProps from 'components/ui/Tooltip/types';

export interface SectionProps {
  additionalContent?: ReactNode;
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
  className?: string;
  dataTest?: string;
  doubleValueProps?: DoubleValueProps;
  hasBottomDivider?: boolean;
  icon?: SvgImageConfig;
  isDisabled?: boolean;
  label?: string;
  labelClassName?: string;
  labelSuffix?: ReactNode;
  onClick?: () => void;
  onTooltipClick?: () => void;
  tooltipProps?: {
    dataTest?: TooltipProps['dataTest'];
    position: TooltipProps['position'];
    text: TooltipProps['text'];
    tooltipClassName?: TooltipProps['tooltipClassName'];
  };
  variant?: 'small' | 'standard';
}

export default interface SectionsProps {
  hasBottomDivider?: SectionProps['hasBottomDivider'];
  sections: SectionProps[];
  variant?: SectionProps['variant'];
}
