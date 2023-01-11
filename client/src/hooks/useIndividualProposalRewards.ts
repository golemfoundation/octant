import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import useContractRewards from './contracts/useContractRewards';
import useCurrentEpoch from './useCurrentEpoch';

import { Rewards } from '../../../typechain-types';

export default function useIndividualProposalRewards(): UseQueryResult<{
  list: Rewards.ProposalRewardsStructOutput[];
  sum: BigNumber;
}> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['individualProposalRewards'],
    () => contractRewards?.individualProposalRewards(currentEpoch! - 1),
    {
      enabled: !!contractRewards && !!currentEpoch && currentEpoch > 1,
      select: response => {
        return {
          list: response![1],
          sum: response![0],
        };
      },
    },
  );
}
