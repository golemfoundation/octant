import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { FormattedCryptoValue } from 'types/formattedCryptoValue';

import { dotAndZeroes } from './regExp';

const GWEI_5 = BigNumber.from(10).pow(14);
const WEI_5 = BigNumber.from(10).pow(5);

export default function getFormattedEthValue(value: BigNumber): FormattedCryptoValue {
  let returnObject: { suffix: string; value: string };
  if (value.isZero()) {
    returnObject = { suffix: 'ETH', value: formatUnits(value) };
  } else if (value.lt(WEI_5)) {
    returnObject = { suffix: 'WEI', value: formatUnits(value, 'wei') };
  } else if (value.lt(GWEI_5)) {
    returnObject = { suffix: 'GWEI', value: formatUnits(value, 'gwei') };
  } else {
    returnObject = { suffix: 'ETH', value: formatUnits(value) };
  }

  const formattedValue = parseFloat(returnObject.value).toFixed(4).replace(dotAndZeroes, '');

  returnObject.value = formattedValue;

  return {
    fullString: `${formattedValue} ${returnObject.suffix}`,
    ...returnObject,
  };
}
