import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { TransactionReceipt } from 'ethereum-abi-types-generator';
import { useAccount } from 'wagmi';

import { BatchWithdrawRequest } from 'hooks/contracts/typings/Vault';
import useContractVault from 'hooks/contracts/useContractVault';

export default function useWithdrawEth(
  options?: UseMutationOptions<TransactionReceipt, unknown, BatchWithdrawRequest[]>,
): UseMutationResult<TransactionReceipt, unknown, BatchWithdrawRequest[]> {
  const contractVault = useContractVault();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async value => {
      return contractVault!.methods.batchWithdraw(value).send({
        from: address as `0x${string}`,
      });
    },
    ...options,
  });
}
