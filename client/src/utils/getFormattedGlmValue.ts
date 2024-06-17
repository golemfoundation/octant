import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import { formatUnitsBigInt } from './formatUnitsBigInt';
import getNumberWithSpaces from './getNumberWithSpaces';

export type GetFormattedGlmValueProps = {
  isUsingHairSpace?: boolean;
  value: bigint;
};

export default function getFormattedGlmValue({
  value,
  isUsingHairSpace = true,
}: GetFormattedGlmValueProps): FormattedCryptoValue {
  const valueString = parseFloat(formatUnitsBigInt(value)).toFixed(0);
  const formattedValue = getNumberWithSpaces(valueString, isUsingHairSpace);
  const suffix = 'GLM';

  return {
    fullString: `${formattedValue} ${suffix}`,
    suffix,
    value: formattedValue,
  };
}
