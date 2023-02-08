import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIndividualReward(): UseQueryResult<BigNumber | undefined> {
  const contractRewards = useContractRewards();
  const {
    metaState: { account },
  } = useMetamask();
  const { data: currentEpoch } = useCurrentEpoch();
  const address = account[0];

  return useQuery(
    ['individualReward'],
    () => contractRewards?.individualReward(currentEpoch! - 1, address),
    { enabled: !!currentEpoch && currentEpoch > 1 && !!address && !!contractRewards },
  );
}
