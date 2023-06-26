import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIndividualReward(): UseQueryResult<BigNumber | undefined> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const contractRewards = useContractRewards();

  return useQuery(
    QUERY_KEYS.individualReward,
    () => contractRewards?.individualReward(currentEpoch! - 1, address!),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!address && !!contractRewards,
    },
  );
}
