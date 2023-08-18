import { UseMutationOptions, UseMutationResult, useMutation } from '@tanstack/react-query';
import { useSignTypedData } from 'wagmi';

import { apiPostAllocate } from 'api/calls/allocate';
import networkConfig from 'constants/networkConfig';
import { AllocationValues } from 'views/AllocationView/types';

const domain = {
  chainId: networkConfig.id,
  name: 'Octant',
  version: '1.0.0',
};

const types = {
  Allocation: [
    { name: 'proposalAddress', type: 'string' },
    { name: 'amount', type: 'string' },
  ],
  AllocationPayload: [{ name: 'allocations', type: 'Allocation[]' }],
};

export default function useAllocate(
  options?: UseMutationOptions<any, unknown, AllocationValues>,
): UseMutationResult<any, unknown, AllocationValues> {
  const { signTypedDataAsync } = useSignTypedData();

  return useMutation({
    mutationFn: async (allocations: AllocationValues) => {
      const allocationsMapped = allocations.map(({ address, value }) => ({
        amount: value.toString(),
        proposalAddress: address,
      }));

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
