import { ContractTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { UseMutationResult, useMutation } from 'react-query';

import useContractAllocations from 'hooks/contracts/useContractAllocations';
import useWallet from 'store/models/wallet/store';

type UseAllocate = {
  onSuccess: () => void;
};

export default function useAllocate({
  onSuccess,
}: UseAllocate): UseMutationResult<
  ContractTransaction,
  unknown,
  { proposalAddress: string; value: string }[]
> {
  const {
    wallet: { web3 },
  } = useWallet();
  const signer = web3?.getSigner();
  const contractAllocations = useContractAllocations({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async allocations => {
      const transactionResponse = await contractAllocations!.allocate(
        allocations.map(({ proposalAddress, value }) => ({
          allocation: parseUnits(value),
          proposal: proposalAddress,
        })),
      );
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    onSuccess,
  });
}
