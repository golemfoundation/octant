import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import networkConfig from 'constants/networkConfig';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCurrentEpoch(
  options?: Omit<UseQueryOptions<BigInt, unknown, number, any>, 'queryKey'>,
): UseQueryResult<number, unknown> {
  const publicClient = usePublicClient({ chainId: networkConfig.id });

  return useQuery({
    queryFn: () =>
      readContractEpochs({
        functionName: 'getCurrentEpoch',
        publicClient,
      }),
    queryKey: QUERY_KEYS.currentEpoch,
    select: res => Number(res),
    ...options,
  });
}
