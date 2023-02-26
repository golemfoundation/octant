import { BigNumber, ContractTransaction } from 'ethers';
import { UseMutationResult, useMutation, UseMutationOptions } from 'react-query';
import { useMetamask } from 'use-metamask';

import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import useContractDeposits from 'hooks/contracts/useContractDeposits';

export default function useWithdraw(
  options?: UseMutationOptions<ContractTransaction, unknown, BigNumber>,
): UseMutationResult<ContractTransaction, unknown, BigNumber> {
  const {
    metaState: { web3 },
  } = useMetamask();
  const signer = web3?.getSigner();
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
