import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetPatronMode, ApiPatronModeResponse } from 'api/calls/patronMode';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useIsPatronMode(
  options?: UseQueryOptions<ApiPatronModeResponse, unknown, boolean, any>,
): UseQueryResult<boolean, unknown> {
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetPatronMode(address!),
    queryKey: QUERY_KEYS.patronMode(address!),
    select: data => data.status,
    ...options,
  });
}
