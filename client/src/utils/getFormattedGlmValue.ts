import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import { dotAndZeroes } from './regExp';

export default function getFormattedGlmValue(value: BigNumber): FormattedCryptoValue {
  const formattedValue = parseFloat(formatUnits(value)).toFixed(4).replace(dotAndZeroes, '');
  const suffix = 'GLM';

  return {
    fullString: `${formattedValue} ${suffix}`,
    suffix,
    value: formattedValue,
  };
}
