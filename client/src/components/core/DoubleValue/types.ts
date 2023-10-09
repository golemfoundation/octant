import { BigNumber } from 'ethers';

import { CryptoCurrency } from 'types/cryptoCurrency';

export const DOUBLE_VALUE_VARIANTS = ['standard', 'small', 'tiny'] as const;
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

export default interface DoubleValueProps {
  className?: string;
  coinPricesServerDowntimeText?: 'Conversion offline' | '...';
  cryptoCurrency?: CryptoCurrency;
  dataTest?: string;
  isDisabled?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  textAlignment?: 'left' | 'right';
  valueCrypto?: BigNumber;
  valueString?: string;
  variant?: DoubleValueVariant;
}
