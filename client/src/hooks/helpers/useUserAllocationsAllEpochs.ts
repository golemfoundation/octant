import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetUserAllocations, Response as ApiResponse } from 'api/calls/userAllocations';
import { QUERY_KEYS } from 'api/queryKeys';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export type ResponseItem = {
  elements: (UserAllocationElement & { epoch: number })[];
  hasUserAlreadyDoneAllocation: boolean;
  isManuallyEdited: boolean;
};

export type Response = ResponseItem[];

export default function useUserAllocationsAllEpochs(): { data: Response; isFetching: boolean } {
  const { address } = useAccount();
  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();

  const userAllocationsAllEpochs: UseQueryResult<ApiResponse>[] = useQueries({
    queries: [...Array(currentEpoch).keys()].map(epoch => ({
      enabled: !!address && currentEpoch !== undefined && currentEpoch > 1,
      queryFn: async () => {
        // For Epoch 0 error 400 is returned.
        try {
          return await apiGetUserAllocations(address as string, epoch);
        } catch (error) {
          return new Promise<ApiResponse>(resolve => {
            resolve({
              allocations: [],
              isManuallyEdited: false,
            });
          });
        }
      },
      queryKey: QUERY_KEYS.userAllocations(epoch),
      retry: false,
    })),
  });

  const isFetchingUserAllAllocations =
    !address ||
    isFetchingCurrentEpoch ||
    userAllocationsAllEpochs.length === 0 ||
    userAllocationsAllEpochs.some(({ isFetching }) => isFetching);

  if (isFetchingUserAllAllocations) {
    return {
      data: [],
      isFetching: isFetchingUserAllAllocations,
    };
  }

  return {
    data: userAllocationsAllEpochs.map(({ data }, index) => {
      const userAllocationsFromBackend = data?.allocations.map(element => ({
        address: element.address,
        epoch: index,
        value: parseUnitsBigInt(element.amount, 'wei'),
      }));

      return {
        elements: userAllocationsFromBackend?.filter(({ value }) => value !== 0n) || [],
        hasUserAlreadyDoneAllocation: !!userAllocationsFromBackend?.length,
        isManuallyEdited: !!data?.isManuallyEdited,
      };
    }),
    isFetching: false,
  };
}
