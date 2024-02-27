import { dotAndZeroes } from './regExp';

export const formatUnitsBigInt = (
  value: bigint, // WEI
  unit: 'wei' | 'gwei' | 'ether' = 'ether',
): string => {
  if (unit === 'wei') {
    return value.toString();
  }
  const numberOfDigits = unit === 'gwei' ? 9 : 18;
  const valueString = value.toString().padStart(numberOfDigits, '0');

  const valueStringSplit = valueString.split('');
  valueStringSplit.splice(-numberOfDigits, 0, valueString.length > numberOfDigits ? '.' : '0.');

  return valueStringSplit.join('').replace(dotAndZeroes, '');
};
