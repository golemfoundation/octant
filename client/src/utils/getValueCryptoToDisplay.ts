import { BigNumber } from 'ethers';

import { CryptoCurrency } from 'types/cryptoCurrency';

import getFormattedEthValue from './getFormattedEthValue';
import getFormattedGlmValue from './getFormattedGlmValue';

export type ValueCryptoToDisplay = {
  cryptoCurrency?: CryptoCurrency;
  valueCrypto?: BigNumber;
};

export default function getValueCryptoToDisplay({
  valueCrypto,
  cryptoCurrency,
}: ValueCryptoToDisplay): string {
  if (!cryptoCurrency || !valueCrypto) {
    return '0.0';
  }

  return cryptoCurrency === 'ethereum'
    ? getFormattedEthValue(valueCrypto).fullString
    : getFormattedGlmValue(valueCrypto).fullString;
}
