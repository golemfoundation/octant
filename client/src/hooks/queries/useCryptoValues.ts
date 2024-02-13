import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { Response, apiGetCryptoValues } from 'api/calls/cryptoValues';
import { QUERY_KEYS } from 'api/queryKeys';
import { SettingsData } from 'store/settings/types';

export default function useCryptoValues(
  fiatCurrency: NonNullable<SettingsData['displayCurrency']>,
  options?: UseQueryOptions<
    Response,
    unknown,
    Response,
    ['cryptoValues', NonNullable<SettingsData['displayCurrency']>]
  >,
): UseQueryResult<Response | undefined, unknown> {
  return useQuery({
    enabled: !!fiatCurrency,
    queryFn: () => apiGetCryptoValues(fiatCurrency!),
    queryKey: QUERY_KEYS.cryptoValues(fiatCurrency!),
    retry: false,
    retryOnMount: false,
    ...options,
  });
}
