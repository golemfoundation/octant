import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import useContractTracker from 'hooks/contracts/useContractTracker';

import useCurrentEpoch from './useCurrentEpoch';

export default function useGlmStaked(): UseQueryResult<BigNumber | undefined> {
  const contractTracker = useContractTracker();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(['glmStaked'], () => contractTracker?.totalDepositAt(currentEpoch!), {
    enabled: !!contractTracker && !!currentEpoch,
  });
}
