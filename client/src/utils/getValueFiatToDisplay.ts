import { Response } from 'api/calls/cryptoValues';
import { FIAT_CURRENCIES_SYMBOLS } from 'constants/currencies';
import { SettingsData } from 'store/settings/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

import { formatUnitsBigInt } from './formatUnitsBigInt';
import getNumberWithSpaces from './getNumberWithSpaces';

export type GetValueFiatToDisplayProps = {
  coinPricesServerDowntimeText?: 'Conversion offline' | '...';
  cryptoCurrency: CryptoCurrency;
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error?: any;
  isUsingHairSpace?: boolean;
  showFiatPrefix?: boolean;
  showLessThanZero?: boolean;
  valueCrypto?: bigint;
};

export default function getValueFiatToDisplay({
  coinPricesServerDowntimeText = 'Conversion offline',
  cryptoCurrency,
  cryptoValues,
  displayCurrency,
  error,
  isUsingHairSpace = true,
  valueCrypto,
  showLessThanZero = false,
  showFiatPrefix = true,
}: GetValueFiatToDisplayProps): string {
  if (error) {
    return coinPricesServerDowntimeText;
  }

  const prefix = FIAT_CURRENCIES_SYMBOLS[displayCurrency] || `${displayCurrency.toUpperCase()} `;

  /**
   * We need to ensure particular cryptoValues[cryptoCurrency][displayCurrency] is already fetched.
   * Otherwise, Cypress tests failed when changing the displayCurrency
   * and requesting to see its fiat value immediately.
   *
   * We need to ensure cryptoValues[cryptoCurrency] is defined too.
   * For the reason unknown coin-prices-server sometimes returns data (cryptoValues defined),
   * yet cryptoValues[cryptoCurrency] is unknown, resulting in a crash.
   * This happens in E2E runs only.
   */
  //
  if (
    !cryptoCurrency ||
    !cryptoValues ||
    !cryptoValues[cryptoCurrency] ||
    !cryptoValues[cryptoCurrency][displayCurrency] ||
    !valueCrypto
  ) {
    return `${showLessThanZero ? '< ' : ''}${showFiatPrefix ? prefix : ''}0.00`;
  }

  const exchangeRate = cryptoValues[cryptoCurrency][displayCurrency];

  const valueFiat = (parseFloat(formatUnitsBigInt(valueCrypto)) * exchangeRate).toFixed(
    displayCurrency === 'jpy' ? 0 : 2,
  );

  if (valueFiat === '0.00' && showLessThanZero) {
    return `< ${prefix}0.00`;
  }

  return `${showFiatPrefix ? prefix : ''}${getNumberWithSpaces(valueFiat, isUsingHairSpace)}`;
}
