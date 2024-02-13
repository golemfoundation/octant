import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetEpochUnusedRewards, Response } from 'api/calls/epochUnusedRewards';
import { QUERY_KEYS } from 'api/queryKeys';

export type UseEpochUnusedRewards = {
  addresses: string[];
  value: BigNumber;
};

export default function useEpochUnusedRewards(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, UseEpochUnusedRewards, any>,
): UseQueryResult<UseEpochUnusedRewards, unknown> {
  return useQuery({
    queryFn: () => apiGetEpochUnusedRewards(epoch),
    queryKey: QUERY_KEYS.epochUnusedRewards(epoch),
    select: response => ({
      addresses: response.addresses,
      value: parseUnits(response.value, 'wei'),
    }),
    ...options,
  });
}
