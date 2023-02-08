import { UseQueryResult, useQuery } from 'react-query';

import useContractEpochs from 'hooks/contracts/useContractEpochs';

export default function useDecisionWindow(): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(['decisionWindow'], () => contractEpochs?.decisionWindow(), {
    enabled: !!contractEpochs,
    select: response => (response ? response.toNumber() * 1000 : undefined),
  });
}
