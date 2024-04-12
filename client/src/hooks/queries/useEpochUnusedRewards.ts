import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochUnusedRewards, Response } from 'api/calls/epochUnusedRewards';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export type UseEpochUnusedRewards = {
  addresses: string[];
  value: bigint;
};

export default function useEpochUnusedRewards(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, UseEpochUnusedRewards, any>,
): UseQueryResult<UseEpochUnusedRewards, unknown> {
  return useQuery({
    queryFn: ({ signal }) => apiGetEpochUnusedRewards(epoch, signal),
    queryKey: QUERY_KEYS.epochUnusedRewards(epoch),
    select: response => ({
      addresses: response.addresses,
      value: parseUnitsBigInt(response.value, 'wei'),
    }),
    ...options,
  });
}
