import { ContractTransaction } from 'ethers';
import { UseMutationResult, useMutation } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractAllocations from './contracts/useContractAllocations';

type UseVote = {
  onSuccess: () => void;
};

export default function useVote({
  onSuccess,
}: UseVote): UseMutationResult<
  ContractTransaction,
  unknown,
  { proposalId: string; value: string }
> {
  const {
    metaState: { web3 },
  } = useMetamask();
  const signer = web3?.getSigner();
  const contractAllocations = useContractAllocations({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async ({ proposalId, value }) => {
      const transactionResponse = await contractAllocations!.vote(proposalId, value);
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    onSuccess,
  });
}
