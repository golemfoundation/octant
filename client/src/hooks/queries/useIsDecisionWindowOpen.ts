import { UseQueryResult, useQuery, UseQueryOptions } from 'react-query';

import useContractEpochs from 'hooks/contracts/useContractEpochs';

export default function useIsDecisionWindowOpen(
  options?: UseQueryOptions<boolean | undefined, unknown, boolean, string[]>,
): UseQueryResult<boolean> {
  const contractEpochs = useContractEpochs();

  return useQuery(['isDecisionWindowOpen'], () => contractEpochs?.isDecisionWindowOpen(), {
    enabled: !!contractEpochs,
    ...options,
  });
}
