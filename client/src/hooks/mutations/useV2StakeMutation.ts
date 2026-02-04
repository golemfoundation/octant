import { useMutation } from '@tanstack/react-query';
import { erc20Abi, Hash, TransactionReceipt } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import env from 'env';
import { writeContractRegenStaker } from 'hooks/contracts/writeContracts';

type UseStakeMutationParams = {
  depositAmount: bigint;
  stakeTokenAddress: Hash;
};

// Return type inherited from useMutation
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useStakeMutation() {
  const { contractRegenStakerAddress } = env;

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: ({ depositAmount, stakeTokenAddress }: UseStakeMutationParams) =>
      // eslint-disable-next-line no-async-promise-executor
      new Promise<TransactionReceipt>(async (resolve, reject) => {
        if (!walletClient) {
          reject(new Error('walletClient is undefined'));
          return;
        }

        if (!publicClient) {
          reject(new Error('publicClient is undefined'));
          return;
        }

        const delegatee = walletClient.account.address;

        try {
          const allowance = await publicClient.readContract({
            abi: erc20Abi,
            address: stakeTokenAddress,
            args: [walletClient.account.address, contractRegenStakerAddress as Hash],
            functionName: 'allowance',
          });

          if (depositAmount > allowance) {
            const hash = await walletClient.writeContract({
              abi: erc20Abi,
              address: stakeTokenAddress,
              args: [contractRegenStakerAddress as Hash, depositAmount],
              functionName: 'approve',
            });

            // Await allowance to be included in a block.
            await publicClient.waitForTransactionReceipt({ hash });
          }

          const stakeTransactionHash = await writeContractRegenStaker({
            args: [depositAmount, delegatee],
            functionName: 'stake',
            walletClient: walletClient!,
          });

          const stakeTransactionReceipt = await publicClient!.waitForTransactionReceipt({
            hash: stakeTransactionHash,
          });

          resolve(stakeTransactionReceipt);
        } catch (error) {
          reject(error);
        }
      }),
  });
}
