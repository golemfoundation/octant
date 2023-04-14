import DoubleValueProps from 'components/core/DoubleValue/types';
import { SvgImageConfig } from 'components/core/Svg/types';

export interface SectionProps {
  doubleValueProps: {
    coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
    cryptoCurrency: DoubleValueProps['cryptoCurrency'];
    valueCrypto: DoubleValueProps['valueCrypto'];
  };
  icon?: SvgImageConfig;
  label?: string;
  onTooltipClick?: () => void;
}

export default interface SectionsProps {
  sections: SectionProps[];
}
