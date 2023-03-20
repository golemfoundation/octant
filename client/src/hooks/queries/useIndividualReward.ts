import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractRewards from 'hooks/contracts/useContractRewards';
import useWallet from 'store/models/wallet/store';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIndividualReward(): UseQueryResult<BigNumber | undefined> {
  const contractRewards = useContractRewards();
  const {
    wallet: { address },
  } = useWallet();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.individualReward,
    () => contractRewards?.individualReward(currentEpoch! - 1, address!),
    { enabled: !!currentEpoch && currentEpoch > 1 && !!address && !!contractRewards },
  );
}
