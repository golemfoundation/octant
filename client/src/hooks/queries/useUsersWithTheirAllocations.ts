import { BigNumber } from 'ethers';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractAllocationsStorage from 'hooks/contracts/useContractAllocationsStorage';

import useCurrentEpoch from './useCurrentEpoch';

type Donor = { address: string; allocation: BigNumber };

export default function useUsersWithTheirAllocations(
  proposalAddress: string,
  options?: UseQueryOptions<[string[], BigNumber[]] | undefined, unknown, any, string[]>,
): UseQueryResult<Donor[]> {
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.usersWithTheirAllocations(proposalAddress),
    () =>
      contractAllocationsStorage?.getUsersWithTheirAllocations(currentEpoch! - 1, proposalAddress),
    {
      enabled: !!contractAllocationsStorage && !!currentEpoch && currentEpoch > 1,
      select: response =>
        response![0].map((address, index) => ({
          address,
          allocation: response![1][index],
        })),
      ...options,
    },
  );
}
