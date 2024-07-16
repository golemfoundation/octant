import { UseQueryResult, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import networkConfig from 'constants/networkConfig';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useIsDecisionWindowOpen(
  options?: Omit<UseQueryOptions<boolean, unknown, boolean, ['isDecisionWindowOpen']>, 'queryKey'>,
): UseQueryResult<boolean, unknown> {
  const publicClient = usePublicClient({ chainId: networkConfig.id });

  return useQuery({
    queryFn: () =>
      readContractEpochs({
        functionName: 'isDecisionWindowOpen',
        publicClient,
      }),
    queryKey: QUERY_KEYS.isDecisionWindowOpen,
    ...options,
  });
}
