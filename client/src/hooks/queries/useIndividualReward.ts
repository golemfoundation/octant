import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetIndividualRewards, Response } from 'api/calls/individualRewards';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIndividualReward(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, bigint, any>,
): UseQueryResult<bigint, unknown> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  const epochToUse = epoch || currentEpoch! - 1;

  return useQuery({
    enabled: ((!!currentEpoch && currentEpoch > 1) || !!epoch) && !!address,
    queryFn: async () => {
      try {
        return await apiGetIndividualRewards(epochToUse, address!);
      } catch (error) {
        return new Promise<Response>(resolve => {
          resolve({ budget: '0' });
        });
      }
    },
    queryKey: QUERY_KEYS.individualReward(epochToUse),
    select: response => parseUnitsBigInt(response.budget, 'wei'),
    ...options,
  });
}
