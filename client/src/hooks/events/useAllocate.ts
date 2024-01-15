import { useState } from 'react';
import { useSignTypedData } from 'wagmi';

import networkConfig from 'constants/networkConfig';
import { getAllocationsMapped } from 'hooks/utils/utils';
import { WebsocketEmitEvent } from 'types/websocketEvents';
import { AllocationValues } from 'views/AllocationView/types';

const websocketService = () => import('services/websocketService');

type UseAllocateProps = {
  nonce: number;
  onSuccess: () => void;
};

type UseAllocate = {
  emit: (allocations: { address: string; value: string }[], isManuallyEdited: boolean) => void;
  isLoading: boolean;
};

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
  AllocationPayload: [
    { name: 'allocations', type: 'Allocation[]' },
    { name: 'nonce', type: 'uint256' },
  ],
};

export default function useAllocate({ onSuccess, nonce }: UseAllocateProps): UseAllocate {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signTypedData } = useSignTypedData({
    domain,
    message: {
      value: 'Octant Allocation',
    },
    onSuccess: async (data, variables) => {
      const { isManuallyEdited, ...restVariables } = variables.message;
      websocketService().then(socket => {
        socket.default.emit(
          WebsocketEmitEvent.allocate,
          JSON.stringify({
            isManuallyEdited,
            payload: restVariables,
            signature: data,
          }),
          () => {
            if (onSuccess) {
              onSuccess();
            }
            setIsLoading(false);
          },
        );
      });
    },
    primaryType: 'AllocationPayload',
    types,
  });

  const allocate = (allocations: AllocationValues, isManuallyEdited: boolean) => {
    setIsLoading(true);
    const allocationsMapped = getAllocationsMapped(allocations);
    const message = {
      allocations: allocationsMapped,
      isManuallyEdited,
      nonce,
    };

    signTypedData({
      message,
      primaryType: 'AllocationPayload',
      types,
    });
  };

  return { emit: allocate, isLoading };
}
