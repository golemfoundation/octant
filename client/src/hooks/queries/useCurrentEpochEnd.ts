import { UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

export default function useCurrentEpochEnd(): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(QUERY_KEYS.currentEpochEnd, () => contractEpochs?.getCurrentEpochEnd(), {
    enabled: !!contractEpochs,
    select: response => response!.toNumber() * 1000,
  });
}
