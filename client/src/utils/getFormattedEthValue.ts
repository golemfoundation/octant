import { GWEI_5, WEI_5 } from 'constants/bigInt';
import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import { formatUnitsBigInt } from './formatUnitsBigInt';
import getNumberWithSpaces from './getNumberWithSpaces';
import { dotAndZeroes } from './regExp';

export default function getFormattedEthValue(
  value: bigint,
  // eslint-disable-next-line default-param-last
  isUsingHairSpace = true,
  shouldIgnoreGwei?: boolean,
  shouldIgnoreWei?: boolean,
  ethPrecission = 4,
): FormattedCryptoValue {
  let returnObject: Omit<FormattedCryptoValue, 'fullString'>;

  const isInGweiRange = value < GWEI_5;

  if (value === 0n) {
    returnObject = { suffix: 'ETH', value: formatUnitsBigInt(value) };
  } else if (value < WEI_5) {
    if (shouldIgnoreWei) {
      return { fullString: '< 0.0001 ETH', suffix: 'ETH', value: '< 0.0001' };
    }
    returnObject = { suffix: 'WEI', value: formatUnitsBigInt(value, 'wei') };
  } else if (isInGweiRange) {
    if (shouldIgnoreGwei) {
      return { fullString: '< 0.0001 ETH', suffix: 'ETH', value: '< 0.0001' };
    }
    returnObject = { suffix: 'GWEI', value: formatUnitsBigInt(value, 'gwei') };
  } else {
    returnObject = { suffix: 'ETH', value: formatUnitsBigInt(value) };
  }

  let formattedValue = parseFloat(returnObject.value).toFixed(isInGweiRange ? 0 : ethPrecission);

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
