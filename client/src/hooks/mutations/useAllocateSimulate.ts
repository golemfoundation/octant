import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiPostAllocateSimulate } from 'api/calls/allocate';
import { getAllocationsMapped } from 'hooks/utils/utils';
import { AllocationValues } from 'views/AllocationView/types';

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
