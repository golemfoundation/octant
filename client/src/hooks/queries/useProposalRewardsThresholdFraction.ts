import { formatUnits } from 'ethers/lib/utils';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export default function useProposalRewardsThresholdFraction(): UseQueryResult<number | undefined> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.proposalRewardsThresholdFraction,
    () => contractRewards?.proposalRewardsThresholdFraction(currentEpoch!),
    {
      enabled: !!contractRewards && !!currentEpoch,
      select: response => parseFloat(formatUnits(response!)),
    },
  );
}
