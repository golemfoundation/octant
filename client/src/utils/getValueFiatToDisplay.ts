import { formatUnits } from 'ethers/lib/utils';

import { Response } from 'api/calls/cryptoValues';
import DoubleValueProps from 'components/core/DoubleValue/types';
import { FIAT_CURRENCIES_SYMBOLS } from 'constants/currencies';
import { SettingsData } from 'store/settings/types';

import getNumberWithSpaces from './getNumberWithSpaces';

export default function getValueFiatToDisplay({
  coinPricesServerDowntimeText = 'Conversion offline',
  cryptoCurrency,
  cryptoValues,
  displayCurrency,
  error,
  isUsingHairSpace = true,
  valueCrypto,
}: {
  coinPricesServerDowntimeText?: DoubleValueProps['coinPricesServerDowntimeText'];
  cryptoCurrency: DoubleValueProps['cryptoCurrency'];
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error?: any;
  isUsingHairSpace?: boolean;
  valueCrypto: DoubleValueProps['valueCrypto'];
}): string {
  if (error) {
    return coinPricesServerDowntimeText;
  }

  const prefix = FIAT_CURRENCIES_SYMBOLS[displayCurrency] || `${displayCurrency.toUpperCase()} `;

  if (!cryptoCurrency || !cryptoValues || !valueCrypto) {
    return `${prefix}0.00`;
  }

  const exchangeRate = cryptoValues[cryptoCurrency][displayCurrency];

  const valueFiat = (parseFloat(formatUnits(valueCrypto)) * exchangeRate).toFixed(
    displayCurrency === 'jpy' ? 0 : 2,
  );

  return `${prefix}${getNumberWithSpaces(valueFiat, isUsingHairSpace)}`;
}
