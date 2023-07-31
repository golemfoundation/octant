import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractEpochs from 'hooks/contracts/useContractEpochs';

import useCurrentEpoch from './useCurrentEpoch';

export default function useCurrentEpochEnd(): UseQueryResult<number | undefined> {
  const contractEpochs = useContractEpochs();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.currentEpochEnd,
    () => contractEpochs?.methods.getCurrentEpochEnd().call(),
    {
      enabled: !!contractEpochs && !!currentEpoch && currentEpoch > 1,
      select: response => Number(response) * 1000,
    },
  );
}
