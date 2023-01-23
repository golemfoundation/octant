import { BigNumber, ContractTransaction } from 'ethers';
import { UseMutationResult, useMutation } from 'react-query';
import { parseUnits } from 'ethers/lib/utils';
import { useMetamask } from 'use-metamask';

import useContractAllocations from './contracts/useContractAllocations';

type UseAllocate = {
  onSuccess: () => void;
};

export default function useAllocate({
  onSuccess,
}: UseAllocate): UseMutationResult<
  ContractTransaction,
  unknown,
  { proposalId: number; value: string }[]
> {
  const {
    metaState: { web3 },
  } = useMetamask();
  const signer = web3?.getSigner();
  const contractAllocations = useContractAllocations({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async allocations => {
      const transactionResponse = await contractAllocations!.allocate(
        allocations.map(({ proposalId, value }) => ({
          allocation: parseUnits(value),
          proposalId: BigNumber.from(proposalId),
        })),
      );
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    onSuccess,
  });
}
