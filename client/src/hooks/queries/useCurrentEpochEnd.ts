import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';

export default function useCurrentEpochEnd(): UseQueryResult<number | undefined> {
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  return useQuery(
    QUERY_KEYS.currentEpochEnd,
    () =>
      readContractEpochs({
        functionName: 'getCurrentEpochEnd',
        publicClient,
      }),
    {
      enabled: !!currentEpoch && currentEpoch > 1,
      select: response => Number(response) * 1000,
    },
  );
}
