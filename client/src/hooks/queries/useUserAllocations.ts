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
  isManuallyEdited: boolean;
};

export default function useUserAllocations(
  epoch?: number,
  options?: UseQueryOptions<ApiResponse, unknown, Response | undefined, any>,
): UseQueryResult<Response | undefined> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    epoch || currentEpoch ? QUERY_KEYS.userAllocations(epoch || currentEpoch! - 1) : [''],
    () => apiGetUserAllocations(address as string, epoch || ((currentEpoch! - 1) as number)),
    {
      enabled: (epoch !== undefined || (!!currentEpoch && currentEpoch > 1)) && !!address,
      select: response => {
        const userAllocationsFromBackend = response!.allocations.map(element => ({
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
          isManuallyEdited: !!response.isManuallyEdited,
        };
      },
      ...options,
    },
  );
}
