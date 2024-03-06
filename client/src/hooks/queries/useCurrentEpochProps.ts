import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

export interface EpochProps {
  decisionWindow: number;
  duration: number;
}

export default function useCurrentEpochProps(): UseQueryResult<EpochProps> {
  const publicClient = usePublicClient();

  return useQuery<{ decisionWindow: BigInt; duration: BigInt }, any, EpochProps>({
    queryFn: () =>
      readContractEpochs({
        functionName: 'getCurrentEpochProps',
        publicClient,
      }),
    queryKey: QUERY_KEYS.currentEpochProps,
    select: response => {
      const { duration, decisionWindow } = response!;
      return {
        decisionWindow: Number(decisionWindow) * 1000,
        duration: Number(duration) * 1000,
      };
    },
  });
}
