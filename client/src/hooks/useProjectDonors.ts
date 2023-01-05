import { BigNumber } from 'ethers';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

type Donor = { address: string; alpha: BigNumber };

export default function useProjectDonors(
  proposalId: string,
  options?: UseQueryOptions<[string[], BigNumber[]] | undefined, unknown, any, string[]>,
): UseQueryResult<Donor[]> {
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['userAlphas', proposalId],
    () => contractAllocationsStorage?.getUsersAlphas(currentEpoch! - 1, proposalId),
    {
      enabled: !!contractAllocationsStorage && !!currentEpoch && currentEpoch - 1 > 0,
      select: response =>
        response![0].map((address, index) => ({
          address,
          alpha: response![1][index],
        })),
      ...options,
    },
  );
}
