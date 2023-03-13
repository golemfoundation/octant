import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractTracker from 'hooks/contracts/useContractTracker';

import useCurrentEpoch from './useCurrentEpoch';

export default function useGlmLocked(): UseQueryResult<BigNumber | undefined> {
  const contractTracker = useContractTracker();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(QUERY_KEYS.glmLocked, () => contractTracker?.totalDepositAt(currentEpoch!), {
    enabled: !!contractTracker && !!currentEpoch,
  });
}
