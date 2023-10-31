import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useIsDecisionWindowOpen(
  options?: UseQueryOptions<boolean, unknown, boolean, ['isDecisionWindowOpen']>,
): UseQueryResult<boolean> {
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.isDecisionWindowOpen,
    () =>
      readContractEpochs({
        functionName: 'isDecisionWindowOpen',
        publicClient,
      }),
    {
      select: () => false,
      ...options,
    },
  );
}
