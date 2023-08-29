import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import getNumberWithSpaces from './getNumberWithSpaces';

export default function getFormattedGlmValue(
  value: BigNumber,
  isUsingHairSpace = true,
): FormattedCryptoValue {
  const valueString = parseFloat(formatUnits(value)).toFixed(0);
  const formattedValue = getNumberWithSpaces(valueString, isUsingHairSpace);
  const suffix = 'GLM';

  return {
    fullString: `${formattedValue} ${suffix}`,
    suffix,
    value: formattedValue,
  };
}
