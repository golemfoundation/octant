import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import { Vault } from 'octant-typechain-types';
import { useSigner } from 'wagmi';

import useContractVault from 'hooks/contracts/useContractVault';

export default function useWithdrawEth(
  options?: UseMutationOptions<ContractTransaction, unknown, Vault.WithdrawPayloadStruct[]>,
): UseMutationResult<ContractTransaction, unknown, Vault.WithdrawPayloadStruct[]> {
  const { data: signer } = useSigner();
  const contractVault = useContractVault({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async value => {
      const transactionResponse = await contractVault!.batchWithdraw(value);
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    ...options,
  });
}
