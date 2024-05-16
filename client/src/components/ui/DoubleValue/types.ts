import { GetFormattedEthValueProps } from 'utils/getFormattedEthValue';
import { GetFormattedGlmValueProps } from 'utils/getFormattedGlmValue';
import { GetValueCryptoToDisplayProps } from 'utils/getValueCryptoToDisplay';
import { GetValueFiatToDisplayProps } from 'utils/getValueFiatToDisplay';

export const DOUBLE_VALUE_VARIANTS = ['big', 'standard', 'small', 'tiny'] as const;
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

type DoubleValueProps = {
  className?: string;
  coinPricesServerDowntimeText?: GetValueFiatToDisplayProps['coinPricesServerDowntimeText'];
  dataTest?: string;
  isDisabled?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  showCryptoSuffix?: GetValueCryptoToDisplayProps['showCryptoSuffix'];
  textAlignment?: 'left' | 'right';
  valueCrypto?: bigint;
  valueString?: string;
  variant?: DoubleValueVariant;
} & (
  | {
      cryptoCurrency: 'ethereum';
      getFormattedEthValueProps?: Omit<GetFormattedEthValueProps, 'value'>;
      getFormattedGlmValueProps?: never;
    }
  | {
      cryptoCurrency: 'golem';
      getFormattedEthValueProps?: never;
      getFormattedGlmValueProps?: Omit<GetFormattedGlmValueProps, 'value'>;
    }
);

export default DoubleValueProps;
