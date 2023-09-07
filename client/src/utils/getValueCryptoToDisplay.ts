import { BigNumber } from 'ethers';

import { CryptoCurrency } from 'types/cryptoCurrency';

import getFormattedEthValue from './getFormattedEthValue';
import getFormattedGlmValue from './getFormattedGlmValue';

export type ValueCryptoToDisplay = {
  cryptoCurrency?: CryptoCurrency;
  isUsingHairSpace?: boolean;
  valueCrypto?: BigNumber;
};

export default function getValueCryptoToDisplay({
  cryptoCurrency,
  isUsingHairSpace = true,
  valueCrypto = BigNumber.from(0),
}: ValueCryptoToDisplay): string {
  return cryptoCurrency === 'ethereum'
    ? getFormattedEthValue(valueCrypto, isUsingHairSpace).fullString
    : getFormattedGlmValue(valueCrypto, isUsingHairSpace).fullString;
}
