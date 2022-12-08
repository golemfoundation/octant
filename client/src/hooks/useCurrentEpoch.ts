import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import env from 'env';

import useEpochsContract from './contracts/useEpochsContract';

export default function useCurrentEpoch(): UseQueryResult<BigNumber | undefined> {
  const { epochsAddress } = env;
  const contractEpochs = useEpochsContract(epochsAddress);

  return useQuery(['currentEpoch'], () => contractEpochs?.getCurrentEpoch(), {
    enabled: !!contractEpochs,
  });
}
