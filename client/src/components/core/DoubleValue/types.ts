import { BigNumber } from 'ethers';

export const DOUBLE_VALUE_VARIANTS = ['standard', 'small'] as const;
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

export default interface DoubleValueProps {
  className?: string;
  coinPricesServerDowntimeText?: 'Conversion offline' | '...';
  cryptoCurrency?: 'golem' | 'ethereum';
  isError?: boolean;
  textAlignment?: 'left' | 'right';
  valueCrypto?: BigNumber;
  valueString?: string;
  variant?: DoubleValueVariant;
}
