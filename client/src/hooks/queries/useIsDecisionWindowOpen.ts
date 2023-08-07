import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';

export default function useIsDecisionWindowOpen(
  options?: UseQueryOptions<boolean, unknown, boolean, ['isDecisionWindowOpen']>,
): UseQueryResult<boolean> {
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.isDecisionWindowOpen,
    () =>
      readContractEpochs({
        functionName: 'isDecisionWindowOpen',
        publicClient,
      }),
    {
      enabled: !!currentEpoch && currentEpoch > 1,
      ...options,
    },
  );
}
