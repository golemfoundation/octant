import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetCurrentEpoch, Response } from 'api/calls/currentEpoch';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useCurrentEpoch(
  options?: UseQueryOptions<Response, unknown, number, ['currentEpoch']>,
): UseQueryResult<number> {
  return useQuery(QUERY_KEYS.currentEpoch, () => apiGetCurrentEpoch(), {
    select: res => res.currentEpoch,
    ...options,
  });
}
