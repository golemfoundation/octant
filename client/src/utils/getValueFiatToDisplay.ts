import { formatUnits } from 'ethers/lib/utils';

import { Response } from 'api/calls/cryptoValues';
import DoubleValueProps from 'components/core/DoubleValue/types';
import { FIAT_CURRENCIES_SYMBOLS } from 'constants/currencies';
import { SettingsData } from 'store/settings/types';

export default function getValueFiatToDisplay({
  cryptoValues,
  cryptoCurrency,
  displayCurrency,
  valueCrypto,
  error,
}: {
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error?: any;
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
