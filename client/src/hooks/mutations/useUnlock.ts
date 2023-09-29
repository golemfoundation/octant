import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { Hash } from 'viem';
import { useWalletClient } from 'wagmi';

import { writeContractDeposits } from 'hooks/contracts/writeContracts';

export default function useUnlock(
  options?: UseMutationOptions<{ hash: Hash; value: BigNumber }, unknown, BigNumber>,
): UseMutationResult<{ hash: Hash; value: BigNumber }, unknown, BigNumber> {
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async value =>
      writeContractDeposits({
        args: [BigInt(value.toHexString())],
        functionName: 'unlock',
        walletClient: walletClient!,
      }).then(data => ({
        hash: data,
        value,
      })),
    ...options,
  });
}
