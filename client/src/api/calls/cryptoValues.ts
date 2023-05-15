import { DisplayCurrencies } from 'constants/currencies';
import env from 'env';
import apiService from 'services/apiService';
import { SettingsData } from 'store/settings/types';
import { CryptoCurrency } from 'types/cryptoCurrency';

type Currencies = {
  [key in DisplayCurrencies]: number;
};

export type Response = { [key in CryptoCurrency]: Currencies };

export function apiGetCryptoValues(
  fiatCurrency: NonNullable<SettingsData['displayCurrency']>,
): Promise<Response> {
  return apiService
    .get(`${env.cryptoValuesEndpoint}simple/price?ids=ethereum,golem&vs_currencies=${fiatCurrency}`)
    .then(({ data }) => data);
}
