import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { CRYPTO_CURRENCIES_TICKERS } from 'constants/currencies';
import { CryptoCurrency } from 'types/cryptoCurrency';

import getFormattedEthValue from './getFormattedEthValue';

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
    : `${formatUnits(valueCrypto)} ${CRYPTO_CURRENCIES_TICKERS[cryptoCurrency]}`;
}
