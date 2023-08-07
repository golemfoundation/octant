import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useWalletClient } from 'wagmi';

import { writeContractVault } from 'hooks/contracts/writeContracts';

export interface BatchWithdrawRequest {
  amount: BigInt;
  epoch: BigInt;
  proof: string | number[][];
}

export default function useWithdrawEth(
  options?: UseMutationOptions<{ hash: string }, unknown, BatchWithdrawRequest[]>,
): UseMutationResult<{ hash: string }, unknown, BatchWithdrawRequest[]> {
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async value => {
      return writeContractVault({ args: [value], functionName: 'batchWithdraw', walletClient: walletClient! });
    },
    ...options,
  });
}
