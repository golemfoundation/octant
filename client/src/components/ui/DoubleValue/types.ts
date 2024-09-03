import { GetValuesToDisplayProps } from 'hooks/helpers/useGetValuesToDisplay';
import { GetFormattedEthValueProps } from 'utils/getFormattedEthValue';
import { GetFormattedGlmValueProps } from 'utils/getFormattedGlmValue';

export const DOUBLE_VALUE_VARIANTS = ['extra-large', 'large', 'standard', 'small', 'tiny'] as const;
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

type DoubleValueProps = {
  className?: string;
  coinPricesServerDowntimeText?: GetValuesToDisplayProps['coinPricesServerDowntimeText'];
  dataTest?: string;
  isDisabled?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  showCryptoSuffix?: GetValuesToDisplayProps['showCryptoSuffix'];
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
