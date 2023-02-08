import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export default function useMatchedRewards(): UseQueryResult<BigNumber> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(['matchedRewards'], () => contractRewards?.matchedRewards(currentEpoch! - 1), {
    enabled: !!currentEpoch && currentEpoch > 1 && !!contractRewards,
  });
}
