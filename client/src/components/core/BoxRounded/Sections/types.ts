import { ReactNode } from 'react';

import DoubleValueProps from 'components/core/DoubleValue/types';
import { SvgImageConfig } from 'components/core/Svg/types';

export interface SectionProps {
  additionalContent?: ReactNode;
  className?: string;
  dataTest?: string;
  doubleValueProps: {
    coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
    cryptoCurrency: DoubleValueProps['cryptoCurrency'];
    valueCrypto: DoubleValueProps['valueCrypto'];
  };
  icon?: SvgImageConfig;
  label?: string;
  labelClassName?: string;
  labelSuffix?: ReactNode;
  onClick?: () => void;
  onTooltipClick?: () => void;
}

export default interface SectionsProps {
  sections: SectionProps[];
}
