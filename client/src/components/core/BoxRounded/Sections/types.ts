import { ReactNode } from 'react';

import DoubleValueProps from 'components/core/DoubleValue/types';
import { SvgImageConfig } from 'components/core/Svg/types';
import TooltipProps from 'components/core/Tooltip/types';

export interface SectionProps {
  additionalContent?: ReactNode;
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
  className?: string;
  dataTest?: string;
  doubleValueProps?: {
    coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
    cryptoCurrency: DoubleValueProps['cryptoCurrency'];
    isDisabled?: DoubleValueProps['isDisabled'];
    isFetching?: DoubleValueProps['isFetching'];
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
    dataTest: TooltipProps['dataTest'];
    position: TooltipProps['position'];
    text: TooltipProps['text'];
  };
}

export default interface SectionsProps {
  hasBottomDivider?: SectionProps['hasBottomDivider'];
  sections: SectionProps[];
}
