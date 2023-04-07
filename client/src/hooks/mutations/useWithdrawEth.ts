import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useSigner } from 'wagmi';

import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import useContractPayoutsManager from 'hooks/contracts/useContractPayoutsManager';

export default function useWithdrawEth(
  options?: UseMutationOptions<ContractTransaction, unknown, string>,
): UseMutationResult<ContractTransaction, unknown, string> {
  const { data: signer } = useSigner();
  const contractPayoutsManager = useContractPayoutsManager({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async value => {
      const transactionResponse = await contractPayoutsManager!.withdrawUser(parseUnits(value), {
        gasLimit: DEPOSIT_WITHDRAW_GAS_LIMIT,
      });
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    ...options,
  });
}
