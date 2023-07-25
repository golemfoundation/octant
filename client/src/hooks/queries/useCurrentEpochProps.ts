import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

import useCurrentEpoch from './useCurrentEpoch';

export interface EpochProps {
  decisionWindow: number;
  duration: number;
}

export default function useCurrentEpochProps(): UseQueryResult<EpochProps> {
  const contractEpochs = useContractEpochs();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(QUERY_KEYS.currentEpochProps, () => contractEpochs?.getCurrentEpochProps(), {
    enabled: !!contractEpochs && !!currentEpoch && currentEpoch > 1,
    select: response => {
      const [_from, _fromTs, _to, duration, decisionWindow] = response!;
      return {
        decisionWindow: decisionWindow.toNumber() * 1000,
        duration: duration.toNumber() * 1000,
      };
    },
  });
}
