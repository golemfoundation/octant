import { CryptoCurrency } from 'types/cryptoCurrency';

export const DOUBLE_VALUE_VARIANTS = ['big', 'standard', 'small', 'tiny'] as const;
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

export default interface DoubleValueProps {
  className?: string;
  coinPricesServerDowntimeText?: 'Conversion offline' | '...';
  cryptoCurrency: CryptoCurrency;
  dataTest?: string;
  isDisabled?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  shouldIgnoreGwei?: boolean;
  textAlignment?: 'left' | 'right';
  valueCrypto?: bigint;
  valueString?: string;
  variant?: DoubleValueVariant;
}
