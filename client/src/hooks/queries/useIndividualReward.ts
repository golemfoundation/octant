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
): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.individualReward,
    () => apiGetIndividualRewards(epoch || currentEpoch! - 1, address!),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!address,
      select: response => parseUnits(response.budget, 'wei'),
      ...options,
    },
  );
}
