import { formatUnits } from 'ethers/lib/utils';

import { Response } from 'api/calls/cryptoValues';
import DoubleValueProps from 'components/core/DoubleValue/types';
import { FIAT_CURRENCIES_SYMBOLS } from 'constants/currencies';
import { SettingsData } from 'store/settings/types';

import getNumberWithSpaces from './getNumberWithSpaces';

export default function getValueFiatToDisplay({
  coinPricesServerDowntimeText = 'Conversion offline',
  cryptoValues,
  cryptoCurrency,
  displayCurrency,
  valueCrypto,
  error,
}: {
  coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error?: any;
  valueCrypto: DoubleValueProps['valueCrypto'];
}): undefined | string {
  if (error) {
    return coinPricesServerDowntimeText;
  }

  const prefix = FIAT_CURRENCIES_SYMBOLS[displayCurrency] || `${displayCurrency.toUpperCase()} `;

  if (!cryptoCurrency || !cryptoValues || !displayCurrency || !valueCrypto) {
    return `${prefix}0.0`;
  }

  const exchangeRate = cryptoValues[cryptoCurrency][displayCurrency];

  const valueFiat = (parseFloat(formatUnits(valueCrypto)) * exchangeRate).toFixed(
    displayCurrency === 'jpy' ? 0 : 2,
  );

  return `${prefix}${getNumberWithSpaces(valueFiat)}`;
}
