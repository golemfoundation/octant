import { BigNumber } from 'ethers';

import { CryptoCurrency } from 'types/cryptoCurrency';

import getFormattedEthValue from './getFormattedEthValue';
import getFormattedGlmValue from './getFormattedGlmValue';

export type ValueCryptoToDisplay = {
  cryptoCurrency?: CryptoCurrency;
  valueCrypto?: BigNumber;
  valueString?: string;
};

export default function getValueCryptoToDisplay({
  valueString,
  valueCrypto,
  cryptoCurrency,
}: ValueCryptoToDisplay): string {
  if (valueString || !cryptoCurrency || !valueCrypto) {
    return valueString || '0.0';
  }

  return cryptoCurrency === 'ethereum'
    ? getFormattedEthValue(valueCrypto).fullString
    : getFormattedGlmValue(valueCrypto).fullString;
}
