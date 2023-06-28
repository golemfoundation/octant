import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { IAllocationsStorage } from 'octant-typechain-types';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractAllocationsStorage from 'hooks/contracts/useContractAllocationsStorage';

import useCurrentEpoch from './useCurrentEpoch';

export type UserAllocationElement = { address: string; value: BigNumber };

type Response = {
  elements: UserAllocationElement[];
  hasUserAlreadyDoneAllocation: boolean;
};

export default function useUserAllocations(
  options?: UseQueryOptions<
    IAllocationsStorage.AllocationStructOutput[] | undefined,
    unknown,
    Response,
    string[]
  >,
): UseQueryResult<Response> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const contractAllocationsStorage = useContractAllocationsStorage();

  return useQuery(
    QUERY_KEYS.userAllocations,
    () => contractAllocationsStorage?.getUserAllocations(currentEpoch! - 1, address!),
    {
      enabled: !!currentEpoch && currentEpoch > 0 && !!address,
      select: response => {
        const userAllocationsFromBackend = response!.map(element => ({
          address: element[0],
          value: element[1],
        }));

        return {
          /**
           * Allocations with value 0 are filtered out.
           * They are not shown anywhere in the UI and should be treated as not done at all.
           */
          elements: userAllocationsFromBackend.filter(({ value }) => !value.isZero()),

          hasUserAlreadyDoneAllocation: !!userAllocationsFromBackend?.length,
        };
      },
      ...options,
    },
  );
}
