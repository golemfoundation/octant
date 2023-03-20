import { BigNumber, ContractTransaction } from 'ethers';
import { UseMutationResult, useMutation, UseMutationOptions } from 'react-query';

import { DEPOSIT_WITHDRAW_GAS_LIMIT } from 'constants/contracts';
import useContractDeposits from 'hooks/contracts/useContractDeposits';
import useWallet from 'store/models/wallet/store';

export default function useLock(
  options?: UseMutationOptions<ContractTransaction, unknown, BigNumber>,
): UseMutationResult<ContractTransaction, unknown, BigNumber> {
  const {
    wallet: { web3 },
  } = useWallet();
  const signer = web3?.getSigner();
  const contractDeposits = useContractDeposits({ signerOrProvider: signer });

  return useMutation({
    mutationFn: async value => {
      const transactionResponse = await contractDeposits!.lock(value, {
        gasLimit: DEPOSIT_WITHDRAW_GAS_LIMIT,
      });
      await transactionResponse.wait(1);
      return transactionResponse;
    },
    ...options,
  });
}
