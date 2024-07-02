import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetAntisybilStatus, Response } from 'api/calls/antisybilStatus';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useAntisybilStatusScore(
  address: string,
  options?: Omit<UseQueryOptions<Response, unknown, number, any>, 'queryKey'>,
): UseQueryResult<number, unknown> {
  return useQuery({
    enabled: !!address,
    queryFn: () => apiGetAntisybilStatus(address!),
    queryKey: QUERY_KEYS.antisybilStatus(address!),
    refetchOnMount: true,
    select: response => Math.round(parseFloat(response.score)),
    ...options,
  });
}
