import { UseQueryResult, useQuery } from 'react-query';

import useContractEpochs from './contracts/useContractEpochs';

export default function useEpochDuration(): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(['epochDuration'], () => contractEpochs?.epochDuration(), {
    enabled: !!contractEpochs,
    select: response => (response ? response?.toNumber() * 1000 : undefined),
  });
}
