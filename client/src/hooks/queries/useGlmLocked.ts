import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractTracker from 'hooks/contracts/useContractTracker';

import useCurrentEpoch from './useCurrentEpoch';

export default function useGlmLocked(): UseQueryResult<BigNumber | undefined> {
  const contractTracker = useContractTracker();
  const { data: currentEpoch } = useCurrentEpoch();

  // totalDepositAt method returns total effective deposit, not just total deposit.
  return useQuery(QUERY_KEYS.glmLocked, () => contractTracker?.totalDepositAt(currentEpoch!), {
    enabled: !!contractTracker && !!currentEpoch,
  });
}
