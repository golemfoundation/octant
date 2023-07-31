import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIsDecisionWindowOpen(
  options?: UseQueryOptions<boolean, unknown, boolean, ['isDecisionWindowOpen']>,
): UseQueryResult<boolean> {
  const contractEpochs = useContractEpochs();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.isDecisionWindowOpen,
    () => contractEpochs?.methods.isDecisionWindowOpen().call(),
    {
      enabled: !!contractEpochs && !!currentEpoch && currentEpoch > 1,
      ...options,
    },
  );
}
