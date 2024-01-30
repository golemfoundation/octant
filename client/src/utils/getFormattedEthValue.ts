import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { GWEI_5, WEI_5 } from 'constants/bigNumber';
import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import getNumberWithSpaces from './getNumberWithSpaces';
import { dotAndZeroes } from './regExp';

export default function getFormattedEthValue(
  value: BigNumber,
  // eslint-disable-next-line default-param-last
  isUsingHairSpace = true,
  shouldIgnoreGwei?: boolean,
): FormattedCryptoValue {
  let returnObject: Omit<FormattedCryptoValue, 'fullString'>;

  const isInGweiRange = value.lt(GWEI_5);

  if (value.isZero()) {
    returnObject = { suffix: 'ETH', value: formatUnits(value) };
  } else if (value.lt(WEI_5)) {
    returnObject = { suffix: 'WEI', value: formatUnits(value, 'wei') };
  } else if (isInGweiRange) {
    if (shouldIgnoreGwei) {
      return { fullString: '< 0.0001 ETH', suffix: 'ETH', value: '< 0.0001' };
    }
    returnObject = { suffix: 'GWEI', value: formatUnits(value, 'gwei') };
  } else {
    returnObject = { suffix: 'ETH', value: formatUnits(value) };
  }

  let formattedValue = parseFloat(returnObject.value).toFixed(isInGweiRange ? 0 : 4);

  if (!isInGweiRange) {
    formattedValue = formattedValue.replace(dotAndZeroes, '');
  }

  formattedValue = getNumberWithSpaces(formattedValue, isUsingHairSpace);

  returnObject.value = formattedValue;

  return {
    fullString: `${formattedValue} ${returnObject.suffix}`,
    ...returnObject,
  };
}
