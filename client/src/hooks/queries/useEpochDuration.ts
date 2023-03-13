import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

export default function useEpochDuration(): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(QUERY_KEYS.epochDuration, () => contractEpochs?.getEpochDuration(), {
    enabled: !!contractEpochs,
    select: response => (response ? response.toNumber() * 1000 : undefined),
  });
}
