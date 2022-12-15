import { UseQueryResult, useQuery } from 'react-query';

import env from 'env';

import useEpochsContract from './contracts/useEpochsContract';

export default function useIsDecisionWindowOpen(): UseQueryResult<boolean> {
  const { epochsAddress } = env;
  const contractEpochs = useEpochsContract(epochsAddress);

  return useQuery(['isDecisionWindowOpen'], () => contractEpochs?.isDecisionWindowOpen(), {
    enabled: !!contractEpochs,
  });
}
