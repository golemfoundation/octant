import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetUserAllocations, Response as ApiResponse } from 'api/calls/userAllocations';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export type UserAllocationElement = { address: string; value: BigNumber };

type Response = {
  elements: UserAllocationElement[];
  hasUserAlreadyDoneAllocation: boolean;
};

export default function useUserAllocations(
  options?: UseQueryOptions<ApiResponse, unknown, Response | undefined, ['userAllocations']>,
): UseQueryResult<Response | undefined> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.userAllocations,
    () => apiGetUserAllocations(address as string, (currentEpoch! - 1) as number),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!address,
      select: response => {
        const userAllocationsFromBackend = response!.map(element => ({
          address: element.address,
          value: parseUnits(element.amount, 'wei'),
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
