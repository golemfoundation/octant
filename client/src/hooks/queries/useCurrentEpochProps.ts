import { useQuery, UseQueryResult } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

export interface EpochProps {
  decisionWindow: number;
  duration: number;
}

export default function useCurrentEpochProps(): UseQueryResult<EpochProps> {
  const contractEpochs = useContractEpochs();

  return useQuery(QUERY_KEYS.currentEpochProps, () => contractEpochs?.getCurrentEpochProps(), {
    enabled: !!contractEpochs,
    select: response => {
      const [_from, _fromTs, _to, duration, decisionWindow] = response!;
      return {
        decisionWindow: decisionWindow.toNumber() * 1000,
        duration: duration.toNumber() * 1000,
      };
    },
  });
}
