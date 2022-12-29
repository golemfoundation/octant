import { BigNumberish } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractRewards from './contracts/useContractRewards';
import useCurrentEpoch from './useCurrentEpoch';

export default function useRewardBudget(): UseQueryResult<BigNumberish | undefined> {
  const contractRewards = useContractRewards();
  const {
    metaState: { account },
  } = useMetamask();
  const { data: currentEpoch } = useCurrentEpoch();
  const address = account[0];

  return useQuery(
    ['rewardBudget'],
    () => contractRewards?.individualReward(currentEpoch! - 1, address),
    { enabled: !!currentEpoch && !!address && !!contractRewards },
  );
}
