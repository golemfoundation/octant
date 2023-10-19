import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiPostAllocateLeverage, ApiPostAllocateLeverageResponse } from 'api/calls/allocate';
import { getAllocationsMapped } from 'hooks/utils/utils';
import { AllocationValues } from 'views/AllocationView/types';

export default function useAllocateLeverage(
  options?: UseMutationOptions<any, unknown, AllocationValues>,
): UseMutationResult<ApiPostAllocateLeverageResponse, unknown, AllocationValues> {
  const { address: userAddress } = useAccount();

  return useMutation({
    mutationFn: async allocations =>
      apiPostAllocateLeverage(
        {
          allocations: getAllocationsMapped(allocations),
        },
        userAddress as string,
      ),
    ...options,
  });
}
