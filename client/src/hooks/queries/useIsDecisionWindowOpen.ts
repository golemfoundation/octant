import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

export default function useIsDecisionWindowOpen(
  options?: UseQueryOptions<boolean | undefined, unknown, boolean, ['isDecisionWindowOpen']>,
): UseQueryResult<boolean> {
  const contractEpochs = useContractEpochs();

  return useQuery(QUERY_KEYS.isDecisionWindowOpen, () => contractEpochs?.isDecisionWindowOpen(), {
    enabled: !!contractEpochs,
    ...options,
  });
}
