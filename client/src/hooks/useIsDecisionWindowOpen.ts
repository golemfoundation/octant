import { UseQueryResult, useQuery } from 'react-query';

import useContractEpochs from './contracts/useContractEpochs';

export default function useIsDecisionWindowOpen(): UseQueryResult<boolean> {
  const contractEpochs = useContractEpochs();

  return useQuery(['isDecisionWindowOpen'], () => contractEpochs?.isDecisionWindowOpen(), {
    enabled: !!contractEpochs,
  });
}
