import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetRewardsRate, Response } from 'api/calls/rewardsRate';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useRewardsRate(
  epoch: number | undefined,
  options?: UseQueryOptions<Response, unknown, number, any>,
): UseQueryResult<number, unknown> {
  return useQuery({
    enabled: !!epoch,
    queryFn: ({ signal }) => apiGetRewardsRate(epoch!, signal),
    queryKey: QUERY_KEYS.rewardsRate(epoch!),
    select: response => response.rewardsRate * 100,
    ...options,
  });
}
