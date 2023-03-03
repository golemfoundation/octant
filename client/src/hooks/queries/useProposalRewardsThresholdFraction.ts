import { formatUnits } from 'ethers/lib/utils';
import { UseQueryResult, useQuery } from 'react-query';

import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export default function useProposalRewardsThresholdFraction(): UseQueryResult<number | undefined> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['proposalRewardsThresholdFraction'],
    () => contractRewards?.proposalRewardsThresholdFraction(currentEpoch!),
    {
      enabled: !!contractRewards && !!currentEpoch,
      select: response => parseFloat(formatUnits(response!)),
    },
  );
}
