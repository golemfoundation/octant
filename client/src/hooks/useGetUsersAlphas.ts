import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

export default function useGetUsersAlphas(
  proposalId: string,
): UseQueryResult<[string[], BigNumber[]]> {
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['userAlphas', proposalId],
    () => contractAllocationsStorage?.getUsersAlphas(currentEpoch! - 1, proposalId),
    {
      enabled: !!contractAllocationsStorage && !!currentEpoch,
    },
  );
}
