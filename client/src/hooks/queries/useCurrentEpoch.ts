import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetCurrentEpoch, Response } from 'api/calls/epochs';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useCurrentEpoch(
  options?: Omit<UseQueryOptions<Response, unknown, number, any>, 'queryKey'>,
): UseQueryResult<number, unknown> {
  return useQuery({
    queryFn: () => apiGetCurrentEpoch(),
    queryKey: QUERY_KEYS.currentEpoch,
    select: ({ currentEpoch }) => currentEpoch,
    staleTime: Infinity,
    ...options,
  });
}
