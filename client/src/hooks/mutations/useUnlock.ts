import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { BigNumber, ContractTransaction } from 'ethers';
import { useSigner } from 'wagmi';

import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import useContractDeposits from 'hooks/contracts/useContractDeposits';

export default function useUnlock(
  options?: UseMutationOptions<ContractTransaction, unknown, BigNumber>,
): UseMutationResult<ContractTransaction, unknown, BigNumber> {
  const { data: signer } = useSigner();
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async value => {
      const transactionResponse = await contractDeposits!.unlock(value, {
        gasLimit: DEPOSIT_WITHDRAW_GAS_LIMIT,
      });
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    ...options,
  });
}
