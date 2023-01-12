import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { dotAndZeroes } from './regExp';

const GWEI_4 = BigNumber.from(10).pow(13);
const WEI_4 = BigNumber.from(10).pow(4);

export default function getFormattedUnits(value: BigNumber): string {
  let returnValue: { suffix: string; value: string };
  if (value.isZero()) {
    returnValue = { suffix: 'ETH', value: formatUnits(value) };
  } else if (value.lte(WEI_4)) {
    returnValue = { suffix: 'WEI', value: formatUnits(value, 'wei') };
  } else if (value.lte(GWEI_4)) {
    returnValue = { suffix: 'GWEI', value: formatUnits(value, 'gwei') };
  } else {
    returnValue = { suffix: 'ETH', value: formatUnits(value) };
  }

  return `${parseFloat(returnValue.value).toFixed(4).replace(dotAndZeroes, '')} ${
    returnValue.suffix
  }`;
}
