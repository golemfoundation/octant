import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useRef } from 'react';
import { useAccount } from 'wagmi';

import { apiPostAllocateLeverage, ApiPostAllocateLeverageResponse } from 'api/calls/allocate';
import { getAllocationsMapped } from 'hooks/utils/utils';
import { AllocationValues } from 'views/AllocationView/types';

export default function useAllocateSimulate(
  options?: UseMutationOptions<any, unknown, AllocationValues>,
): UseMutationResult<ApiPostAllocateLeverageResponse, unknown, AllocationValues> {
  const { address: userAddress } = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async allocations => {
      abortControllerRef.current = new AbortController();
      return apiPostAllocateLeverage(
        {
          allocations: getAllocationsMapped(allocations),
        },
        userAddress as string,
        abortControllerRef.current.signal,
      );
    },
    ...options,
  });

  const reset = () => {
    abortControllerRef.current?.abort();
    mutation.reset();
  };

  return { ...mutation, reset };
}
