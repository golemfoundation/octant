import { useState } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';

import { SignatureOpType, apiPostPendingMultisigSignatures } from 'api/calls/multisigSignatures';
import { handleError } from 'api/errorMessages';
import networkConfig from 'constants/networkConfig';
import useIsContract from 'hooks/queries/useIsContract';
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
  const { address } = useAccount();
  const { data: isContract } = useIsContract();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signTypedData } = useSignTypedData({
    domain,
    message: {
      value: 'Octant Allocation',
    },
    onError: error => {
      // @ts-expect-error Error is of type 'unknown', but it is API or contract error.
      const hasUserRejectedTransaction = error?.cause?.code === 4001;
      // @ts-expect-error Error is of type 'unknown', but it is API or contract error.
      const reason = hasUserRejectedTransaction ? 4001 : error.reason;
      handleError(reason);
      setIsLoading(false);
    },
    onSuccess: async (data, variables) => {
      const { isManuallyEdited, ...restVariables } = variables.message;
      if (isContract) {
        return;
      }
      websocketService().then(socket => {
        socket.default.emit(
          WebsocketEmitEvent.allocate,
          JSON.stringify({
            isManuallyEdited,
            payload: restVariables,
            signature: data,
            userAddress: address,
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
    if (!isContract) {
      setIsLoading(true);
    }
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

    if (isContract) {
      apiPostPendingMultisigSignatures(
        address!,
        {
          isManuallyEdited,
          payload: {
            allocations: allocationsMapped,
            nonce,
          },
        },
        SignatureOpType.ALLOCATION,
      );
    }
  };

  return { emit: allocate, isLoading };
}
