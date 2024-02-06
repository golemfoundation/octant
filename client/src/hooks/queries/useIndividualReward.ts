import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetIndividualRewards, Response } from 'api/calls/individualRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIndividualReward(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber, unknown> {
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
    select: response => parseUnits(response.budget, 'wei'),
    ...options,
  });
}
