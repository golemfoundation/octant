import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { Hash } from 'viem';
import { useWalletClient } from 'wagmi';

import { writeContractDeposits } from 'hooks/contracts/writeContracts';

export default function useUnlock(
  options?: UseMutationOptions<{ hash: Hash; value: bigint }, unknown, bigint>,
): UseMutationResult<{ hash: Hash; value: bigint }, unknown, bigint> {
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async value =>
      writeContractDeposits({
        args: [`0x${value.toString(16)}`],
        functionName: 'unlock',
        walletClient: walletClient!,
      }).then(data => ({
        hash: data,
        value,
      })),
    ...options,
  });
}
