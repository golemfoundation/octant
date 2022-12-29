import { UseQueryResult, useQuery } from 'react-query';
import { formatUnits } from 'ethers/lib/utils';

import useContractRewards from './contracts/useContractRewards';
import useCurrentEpoch from './useCurrentEpoch';

export default function useStakedRatio(): UseQueryResult<string | undefined> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(['stakedRation'], () => contractRewards?.stakedRatio(currentEpoch!), {
    enabled: !!contractRewards && !!currentEpoch,
    // value here needs to be multiplied by 100 to get the percentage.
    select: response => formatUnits(response!.mul(100)),
  });
}
