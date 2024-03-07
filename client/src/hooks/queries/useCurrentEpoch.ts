import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { useEffect } from 'react';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCurrentEpoch(
  options?: Omit<UseQueryOptions<BigInt, unknown, number, any>, 'queryKey'>,
): UseQueryResult<number, unknown> {
  const publicClient = usePublicClient();

  const useCurrentEpochQuery = useQuery({
    queryFn: () =>
      readContractEpochs({
        functionName: 'getCurrentEpoch',
        publicClient,
      }),
    queryKey: QUERY_KEYS.currentEpoch,
    select: res => Number(res),
    ...options,
  });

  useEffect(() => {
    if (window.Cypress) {
      // @ts-expect-error Left for debug purposes.
      window.useCurrentEpochQuery = useCurrentEpochQuery;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useCurrentEpochQuery;
}
