import { UseQueryResult, useQuery, UseQueryOptions } from 'react-query';

import { Response, apiGetCryptoValues } from 'api/calls/cryptoValues';
import { QUERY_KEYS } from 'api/queryKeys';
import { SettingsData } from 'store/settings/types';

export default function useCryptoValues(
  fiatCurrency: SettingsData['displayCurrency'],
  options?: UseQueryOptions<Response, unknown, Response, string[]>,
): UseQueryResult<Response | undefined> {
  return useQuery(QUERY_KEYS.cryptoValues(fiatCurrency!), () => apiGetCryptoValues(fiatCurrency!), {
    enabled: !!fiatCurrency,
    retry: false,
    retryOnMount: false,
    ...options,
  });
}
