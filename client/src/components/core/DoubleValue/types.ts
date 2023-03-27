import { BigNumber } from 'ethers';

export const DOUBLE_VALUE_VARIANTS = ['standard', 'small'];
export type DoubleValueVariant = (typeof DOUBLE_VALUE_VARIANTS)[number];

export default interface DoubleValueProps {
  className?: string;
  cryptoCurrency?: 'golem' | 'ethereum';
  textAlignment?: 'left' | 'right';
  valueCrypto?: BigNumber;
  valueString?: string;
  variant?: DoubleValueVariant;
}
