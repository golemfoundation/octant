import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetIndividualRewards, Response } from 'api/calls/individualRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';
import useIsDecisionWindowOpen from './useIsDecisionWindowOpen';

export default function useIndividualReward(
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, BigNumber, any>,
): UseQueryResult<BigNumber> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const epochToUse = epoch || currentEpoch! - 1;

  return useQuery(
    QUERY_KEYS.individualReward(epochToUse),
    () => apiGetIndividualRewards(epochToUse, address!),
    {
      enabled:
        ((!!currentEpoch && currentEpoch > 1 && !!isDecisionWindowOpen) || !!epoch) && !!address,
      select: response => parseUnits(response.budget, 'wei'),
      ...options,
    },
  );
}
