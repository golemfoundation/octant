import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useWalletClient } from 'wagmi';

import { writeContractDeposits } from 'hooks/contracts/writeContracts';

export default function useLock(
  options?: UseMutationOptions<string, unknown, BigNumber>,
): UseMutationResult<string, unknown, BigNumber> {
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async value => {
      return writeContractDeposits({
        args: [BigInt(value.toHexString())],
        functionName: 'lock',
        walletClient: walletClient!,
      });
    },
    ...options,
  });
}
