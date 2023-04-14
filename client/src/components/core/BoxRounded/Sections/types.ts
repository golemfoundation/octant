import DoubleValueProps from 'components/core/DoubleValue/types';
import { SvgImageConfig } from 'components/core/Svg/types';

export interface SectionProps {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  icon?: SvgImageConfig;
  label?: string;
  onTooltipClick?: () => void;
  valueCrypto: DoubleValueProps['valueCrypto'];
}

export default interface SectionsProps {
  sections: SectionProps[];
}
