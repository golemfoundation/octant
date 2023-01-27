import { UseQueryResult, useQuery } from 'react-query';

import useContractEpochs from './contracts/useContractEpochs';

export default function useStart(): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(['start'], () => contractEpochs?.start(), {
    enabled: !!contractEpochs,
    select: response => (response ? response.toNumber() * 1000 : undefined),
  });
}
