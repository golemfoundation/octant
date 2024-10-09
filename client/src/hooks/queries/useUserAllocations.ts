import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  apiGetUserAllocations,
  GetUserAllocationsResponse as ApiResponse,
} from 'api/calls/userAllocations';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import useCurrentEpoch from './useCurrentEpoch';

export type UserAllocationElement = { address: string; value: bigint };

export type Response = {
  elements: UserAllocationElement[];
  hasUserAlreadyDoneAllocation: boolean;
  isManuallyEdited: boolean;
};

export default function useUserAllocations(
  epoch?: number,
  options?: Omit<UseQueryOptions<ApiResponse, unknown, Response | undefined, any>, 'queryKey'>,
): UseQueryResult<Response | undefined, unknown> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery({
    enabled: (epoch !== undefined || (!!currentEpoch && currentEpoch > 1)) && !!address,
    queryFn: () =>
      apiGetUserAllocations(address as string, epoch || ((currentEpoch! - 1) as number)),
    queryKey: epoch || currentEpoch ? QUERY_KEYS.userAllocations(epoch || currentEpoch! - 1) : [''],
    select: response => {
      const userAllocationsFromBackend = response!.allocations.map(element => ({
        address: element.address,
        value: parseUnitsBigInt(element.amount, 'wei'),
      }));

      return {
        /**
         * Allocations with value 0 are filtered out.
         * They are not shown anywhere in the UI and should be treated as not done at all.
         */
        elements: userAllocationsFromBackend.filter(({ value }) => value !== 0n),
        hasUserAlreadyDoneAllocation: !!userAllocationsFromBackend?.length,
        isManuallyEdited: !!response.isManuallyEdited,
      };
    },
    staleTime: Infinity,
    ...options,
  });
}
