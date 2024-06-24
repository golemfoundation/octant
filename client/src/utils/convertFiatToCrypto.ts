import { Response } from 'api/calls/cryptoValues';
import { SettingsData } from 'store/settings/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

import { parseUnitsBigInt } from './parseUnitsBigInt';

export type ConvertFiatToCryptoProps = {
  coinPricesServerDowntimeText?: 'Conversion offline' | '...';
  cryptoCurrency: CryptoCurrency;
  cryptoValues?: Response;
  displayCurrency: NonNullable<SettingsData['displayCurrency']>;
  error?: any;
  valueFiat?: string;
};

export default function convertFiatToCrypto({
  cryptoCurrency,
  cryptoValues,
  displayCurrency,
  valueFiat,
}: ConvertFiatToCryptoProps): bigint {
  if (
    !cryptoCurrency ||
    !cryptoValues ||
    !cryptoValues[cryptoCurrency] ||
    !cryptoValues[cryptoCurrency][displayCurrency] ||
    !valueFiat
  ) {
    return 0n;
  }

  const exchangeRate = cryptoValues[cryptoCurrency][displayCurrency];

  return parseUnitsBigInt(`${parseFloat(valueFiat) / exchangeRate}`);
}
