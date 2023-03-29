import { formatUnits } from 'ethers/lib/utils';

import DoubleValueProps from 'components/core/DoubleValue/types';
import { CRYPTO_CURRENCIES_TICKERS } from 'constants/currencies';

import getFormattedEthValue from './getFormattedEthValue';

export default function getValueCryptoToDisplay({
  valueString,
  valueCrypto,
  cryptoCurrency,
}: {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  valueCrypto: DoubleValueProps['valueCrypto'];
  valueString?: DoubleValueProps['valueString'];
}): string {
  if (valueString || !cryptoCurrency || !valueCrypto) {
    return valueString || '0.0';
  }

  return cryptoCurrency === 'ethereum'
    ? getFormattedEthValue(valueCrypto).fullString
    : `${formatUnits(valueCrypto)} ${CRYPTO_CURRENCIES_TICKERS[cryptoCurrency]}`;
}
