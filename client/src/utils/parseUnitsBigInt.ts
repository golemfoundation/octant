import { trimStart } from 'lodash';

export const parseUnitsBigInt = (value: string, unit: 'ether' | 'wei' = 'ether'): bigint => {
  if (unit === 'wei') {
    return BigInt(value);
  }

  const [integerPart, fractionalPart] = value.split('.');

  const trimmedIntegerPart = trimStart(integerPart, '0');
  const trimmedFractionalPart = trimStart(fractionalPart, '0');

  // eslint-disable-next-line no-unsafe-optional-chaining
  const mul = 18 - fractionalPart?.length || 0;

  if (!trimmedFractionalPart) {
    return BigInt(integerPart) * BigInt(1e18);
  }
  if (!trimmedIntegerPart) {
    return BigInt(fractionalPart) * BigInt(10 ** mul);
  }

  return BigInt(integerPart + fractionalPart) * BigInt(10 ** mul);
};
