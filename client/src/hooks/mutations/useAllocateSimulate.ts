import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';

import { apiPostAllocateLeverage, ApiPostAllocateLeverageResponse } from 'api/calls/allocate';
import { getAllocationsMapped } from 'hooks/utils/utils';
import { AllocationValues } from 'views/AllocationView/types';

export type AllocateSimulate = Omit<ApiPostAllocateLeverageResponse, 'threshold'> & {
  threshold: BigNumber;
};

export default function useAllocateSimulate(
  options?: UseMutationOptions<any, unknown, AllocationValues>,
): UseMutationResult<AllocateSimulate, unknown, AllocationValues> {
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

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    mutation.reset();
  }, [abortControllerRef, mutation]);

  return {
    ...mutation,
    data: mutation.data && {
      ...mutation.data,
      threshold: parseUnits(mutation.data.threshold, 'wei'),
    },
    reset,
  };
}
