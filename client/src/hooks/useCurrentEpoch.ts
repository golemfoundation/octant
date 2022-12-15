import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import useContractEpochs from './contracts/useContractEpochs';

export default function useCurrentEpoch(): UseQueryResult<BigNumber | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(['currentEpoch'], () => contractEpochs?.getCurrentEpoch(), {
    enabled: !!contractEpochs,
  });
}
