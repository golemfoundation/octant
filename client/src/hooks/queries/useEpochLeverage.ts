import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochLeverage, Response } from 'api/calls/epochLeverage';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useEpochLeverage(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, number, any>,
): UseQueryResult<number, unknown> {
  return useQuery({
    queryFn: () => apiGetEpochLeverage(epoch),
    queryKey: QUERY_KEYS.epochLeverage(epoch),
    select: response => response.leverage,
    ...options,
  });
}
