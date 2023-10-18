import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetPatronMode, ApiPatronModeResponse } from 'api/calls/patronMode';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useIsPatronMode(
  options?: UseQueryOptions<ApiPatronModeResponse, unknown, boolean, any>,
): UseQueryResult<boolean> {
  const { address } = useAccount();

  return useQuery(QUERY_KEYS.patronMode(address!), () => apiGetPatronMode(address!), {
    enabled: !!address,
    select: data => data.status,
    ...options,
  });
}
