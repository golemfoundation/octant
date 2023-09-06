import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCurrentEpoch(
  options?: UseQueryOptions<BigInt, unknown, number, ['currentEpoch']>,
): UseQueryResult<number> {
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.currentEpoch,
    () =>
      readContractEpochs({
        functionName: 'getCurrentEpoch',
        publicClient,
      }),
    {
      select: res => Number(res),
      ...options,
    },
  );
}
