import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export default function useCurrentEpochEnd(): UseQueryResult<number | undefined> {
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.currentEpochEnd,
    () =>
      readContractEpochs({
        functionName: 'getCurrentEpochEnd',
        publicClient,
      }),
    {
      select: response => Number(response) * 1000,
    },
  );
}
