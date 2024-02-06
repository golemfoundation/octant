import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCurrentEpochEnd(): UseQueryResult<number | undefined> {
  const publicClient = usePublicClient();

  return useQuery({
    queryFn: () =>
      readContractEpochs({
        functionName: 'getCurrentEpochEnd',
        publicClient,
      }),
    queryKey: QUERY_KEYS.currentEpochEnd,
    select: response => Number(response) * 1000,
  });
}
