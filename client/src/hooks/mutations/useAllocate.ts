import { UseMutationResult, useMutation } from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import { useSigner } from 'wagmi';

import useContractAllocations from 'hooks/contracts/useContractAllocations';
import { AllocationValues } from 'views/AllocationView/types';

type UseAllocate = {
  onSuccess: () => void;
};

export default function useAllocate({
  onSuccess,
}: UseAllocate): UseMutationResult<ContractTransaction, unknown, AllocationValues> {
  const { data: signer } = useSigner();
  const contractAllocations = useContractAllocations({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async allocations => {
      const transactionResponse = await contractAllocations!.allocate(
        allocations.map(({ address, value }) => ({
          allocation: value,
          proposal: address,
        })),
      );
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    onSuccess,
  });
}
