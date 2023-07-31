import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { TransactionReceipt } from 'ethereum-abi-types-generator';
import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';

import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import useContractDeposits from 'hooks/contracts/useContractDeposits';

export default function useUnlock(
  options?: UseMutationOptions<TransactionReceipt, unknown, BigNumber>,
): UseMutationResult<TransactionReceipt, unknown, BigNumber> {
  const contractDeposits = useContractDeposits();
  const { address } = useAccount();
  return useMutation({
    mutationFn: async value => {
      return (
        contractDeposits!.methods
          // @ts-expect-error generated typing does not understand options.
          .unlock(BigInt(value.toHexString()), {
            gas: DEPOSIT_WITHDRAW_GAS_LIMIT,
          })
          .send({
            from: address as `0x${string}`,
          })
      );
    },
    ...options,
  });
}
