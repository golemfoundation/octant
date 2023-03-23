import env from 'env';
import apiService from 'services/apiService';
import { SettingsStore } from 'store/models/settings/types';

export function apiGetCryptoValues(
  fiatCurrency: NonNullable<SettingsStore['displayCurrency']>,
): Promise<any> {
  return apiService
    .get(`${env.cryptoValuesEndpoint}simple/price?ids=ethereum,golem&vs_currencies=${fiatCurrency}`)
    .then(({ data }) => data);
}
