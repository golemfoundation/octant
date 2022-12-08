import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import env from 'env';

import useCurrentEpoch from './useCurrentEpoch';
import useRewardsContract from './contracts/useRewardsContract';

export default function useRewardBudget(): UseQueryResult<number | undefined, unknown> {
  const { rewardsAddress } = env;
  const contractRewards = useRewardsContract(rewardsAddress);
  const {
    metaState: { account },
  } = useMetamask();
  const address = account[0];

  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['rewardBudget'],
    () => contractRewards?.individualReward(currentEpoch!, address),
    {
      enabled: !!currentEpoch && !!address && !!contractRewards,
      select: data => data!.toNumber(),
    },
  );
}
