import { formatUnits } from 'ethers/lib/utils';

import { CRYPTO_CURRENCIES_TICKERS, FIAT_CURRENCIES_SYMBOLS } from 'constants/currencies';
import { Response } from 'hooks/queries/useCryptoValues';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import DoubleValueProps from './types';

export function getValueFiatToDisplay({
  cryptoValues,
  cryptoCurrency,
  displayCurrency,
  valueCrypto,
  error,
}: {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: DoubleValueProps['displayCurrency'];
  error: any;
  valueCrypto: DoubleValueProps['valueCrypto'];
}): undefined | string {
  if (error) {
    return 'Conversion offline';
  }

  const prefix = FIAT_CURRENCIES_SYMBOLS[displayCurrency] || displayCurrency.toUpperCase();

  if (!cryptoCurrency || !cryptoValues || !displayCurrency || !valueCrypto) {
    return `${prefix} 0.0`;
  }

  const exchangeRate = cryptoValues[cryptoCurrency][displayCurrency];

  return `${prefix} ${(parseFloat(formatUnits(valueCrypto)) * exchangeRate).toFixed(2)}`;
}

export function getValueCryptoToDisplay({
  valueString,
  valueCrypto,
  cryptoCurrency,
}: {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  valueCrypto: DoubleValueProps['valueCrypto'];
  valueString: DoubleValueProps['valueString'];
}): string {
  if (valueString || !cryptoCurrency || !valueCrypto) {
    return valueString || '0.0';
  }

  return cryptoCurrency === 'ethereum'
    ? getFormattedEthValue(valueCrypto).fullString
    : `${formatUnits(valueCrypto)} ${CRYPTO_CURRENCIES_TICKERS[cryptoCurrency]}`;
}

export function getValuesToDisplay({
  cryptoCurrency,
  cryptoValues,
  displayCurrency,
  valueCrypto,
  valueString,
  isCryptoMainValueDisplay,
  error,
}: {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: DoubleValueProps['displayCurrency'];
  error: any;
  isCryptoMainValueDisplay: DoubleValueProps['isCryptoMainValueDisplay'];
  valueCrypto: DoubleValueProps['valueCrypto'];
  valueString?: DoubleValueProps['valueString'];
}): {
  primary?: string;
  secondary?: string;
} {
  if (valueString) {
    return {
      primary: valueString,
    };
  }

  const valueCryptoToDisplay = getValueCryptoToDisplay({
    cryptoCurrency,
    valueCrypto,
    valueString,
  });
  const valueFiatToDisplay = getValueFiatToDisplay({
    cryptoCurrency,
    cryptoValues,
    displayCurrency,
    error,
    valueCrypto,
  });

  return isCryptoMainValueDisplay
    ? {
        primary: valueCryptoToDisplay,
        secondary: valueFiatToDisplay,
      }
    : {
        primary: valueFiatToDisplay,
        secondary: valueCryptoToDisplay,
      };
}
