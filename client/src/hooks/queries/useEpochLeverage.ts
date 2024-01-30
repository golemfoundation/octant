import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochLeverage, Response } from 'api/calls/epochLeverage';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useEpochLeverage(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, number, any>,
): UseQueryResult<number> {
  return useQuery(QUERY_KEYS.epochLeverage(epoch), () => apiGetEpochLeverage(epoch), {
    select: response => response.leverage,
    ...options,
  });
}
