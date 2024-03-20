import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';
import { comma } from 'utils/regExp';

export function getAdjustedValue(
  newValue: string,
  isGweiRange: boolean,
  operation: 'multiply' | 'divide',
): string {
  if (isGweiRange && newValue) {
    const adjustedValueBigInt =
      operation === 'multiply'
        ? parseUnitsBigInt(newValue) * 1000000000n
        : parseUnitsBigInt(newValue) / 1000000000n;
    return (
      formatUnitsBigInt(adjustedValueBigInt)
        // @ts-expect-error TS method collision.
        .toLocaleString('fullwide', {
          maximumSignificantDigits: 18,
          useGrouping: false,
        })
        .replace(comma, '.')
    );
  }
  return newValue;
}
