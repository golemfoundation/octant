import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

export default function useCurrentEpoch(
  options?: UseQueryOptions<number | undefined, unknown, number | undefined, string[]>,
): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();

  return useQuery(QUERY_KEYS.currentEpoch, () => contractEpochs?.getCurrentEpoch(), {
    enabled: !!contractEpochs,
    ...options,
  });
}
