import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiPostAllocateSimulate } from 'api/calls/allocate';
import { AllocationValues } from 'views/AllocationView/types';

import { getAllocationsMapped } from './utils';

type Response = {
  rewards: {
    address: string;
    allocated: string;
    matched: string;
  }[];
};

export default function useAllocateSimulate(
  options?: UseMutationOptions<any, unknown, AllocationValues>,
): UseMutationResult<Response, unknown, AllocationValues> {
  const { address: userAddress } = useAccount();

  return useMutation({
    mutationFn: async allocations =>
      apiPostAllocateSimulate(
        {
          allocations: getAllocationsMapped(allocations),
        },
        userAddress as string,
      ),
    ...options,
  });
}
