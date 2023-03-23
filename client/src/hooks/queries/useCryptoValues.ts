import { UseQueryResult, useQuery, UseQueryOptions } from 'react-query';

import { apiGetCryptoValues } from 'api/calls/cryptoValues';
import { QUERY_KEYS } from 'api/queryKeys';
import { DisplayCurrencies } from 'constants/currencies';
import { SettingsStore } from 'store/models/settings/types';

type Currencies = {
  [key in DisplayCurrencies]: number;
};

export type Response = {
  ethereum: Currencies;
  golem: Currencies;
};

export default function useCryptoValues(
  fiatCurrency: SettingsStore['displayCurrency'],
  options?: UseQueryOptions<Response, unknown, Response, string[]>,
): UseQueryResult<Response | undefined> {
  return useQuery(QUERY_KEYS.cryptoValues(fiatCurrency!), () => apiGetCryptoValues(fiatCurrency!), {
    enabled: !!fiatCurrency,
    retry: false,
    retryOnMount: false,
    ...options,
  });
}
