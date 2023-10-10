import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { Hash } from 'viem';
import { useWalletClient } from 'wagmi';

import { writeContractVault } from 'hooks/contracts/writeContracts';

export interface BatchWithdrawRequest {
  amount: BigInt;
  epoch: BigInt;
  proof: string | number[][];
}

export default function useWithdrawEth(
  options?: UseMutationOptions<
    { hash: Hash; value: BatchWithdrawRequest[] },
    unknown,
    BatchWithdrawRequest[]
  >,
): UseMutationResult<
  { hash: Hash; value: BatchWithdrawRequest[] },
  unknown,
  BatchWithdrawRequest[]
> {
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async value =>
      writeContractVault({
        args: [value],
        functionName: 'batchWithdraw',
        walletClient: walletClient!,
      }).then(data => ({
        hash: data,
        value,
      })),
    ...options,
  });
}
