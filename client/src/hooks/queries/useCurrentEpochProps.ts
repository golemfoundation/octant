import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import { readContractEpochs } from 'hooks/contracts/readContracts';

import useCurrentEpoch from './useCurrentEpoch';

export interface EpochProps {
  decisionWindow: number;
  duration: number;
}

export default function useCurrentEpochProps(): UseQueryResult<EpochProps> {
  const { data: currentEpoch } = useCurrentEpoch();
  const publicClient = usePublicClient();

  return useQuery<{ decisionWindow: BigInt; duration: BigInt }, any, EpochProps>(
    QUERY_KEYS.currentEpochProps,
    () =>
      readContractEpochs({
        functionName: 'getCurrentEpochProps',
        publicClient,
      }),
    {
      enabled: !!currentEpoch && currentEpoch > 1,
      select: response => {
        const { duration, decisionWindow } = response!;
        return {
          decisionWindow: Number(decisionWindow) * 1000,
          duration: Number(duration) * 1000,
        };
      },
    },
  );
}
