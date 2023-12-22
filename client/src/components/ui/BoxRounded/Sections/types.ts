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
  doubleValueProps?: {
    coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
    cryptoCurrency: DoubleValueProps['cryptoCurrency'];
    dataTest?: DoubleValueProps['dataTest'];
    isDisabled?: DoubleValueProps['isDisabled'];
    isFetching?: DoubleValueProps['isFetching'];
    shouldIgnoreGwei?: DoubleValueProps['shouldIgnoreGwei'];
    valueCrypto: DoubleValueProps['valueCrypto'];
  };
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
  };
  variant?: 'small' | 'standard';
}

export default interface SectionsProps {
  hasBottomDivider?: SectionProps['hasBottomDivider'];
  sections: SectionProps[];
  variant?: SectionProps['variant'];
}
