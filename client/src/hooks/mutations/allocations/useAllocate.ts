import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useSignTypedData } from 'wagmi';

import { apiPostAllocate } from 'api/calls/allocate';
import networkConfig from 'constants/networkConfig';
import { AllocationValues } from 'views/AllocationView/types';

import { getAllocationsMapped } from './utils';

const domain = {
  chainId: networkConfig.id,
  name: 'Octant',
  version: '1.0.0',
};

const types = {
  Allocation: [
    { name: 'proposalAddress', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  AllocationPayload: [{ name: 'allocations', type: 'Allocation[]' }],
};

export default function useAllocate(
  options?: UseMutationOptions<any, unknown, AllocationValues>,
): UseMutationResult<any, unknown, AllocationValues> {
  const { signTypedDataAsync } = useSignTypedData();

  return useMutation({
    mutationFn: async (allocations: AllocationValues) => {
      const allocationsMapped = getAllocationsMapped(allocations);

      const message = {
        allocations: allocationsMapped,
      };

      return signTypedDataAsync({
        domain,
        message,
        primaryType: 'AllocationPayload',
        types,
      }).then(signature =>
        apiPostAllocate({
          payload: {
            allocations: allocationsMapped,
          },
          signature,
        }),
      );
    },
    ...options,
  });
}
