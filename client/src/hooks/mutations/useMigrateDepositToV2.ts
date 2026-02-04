import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  TransactionReceipt,
  Hash,
  // erc20Abi,
  // encodeFunctionData,
  // numberToHex
} from 'viem';
import {
  useAccount,
  // useConnectorClient,
} from 'wagmi';
// import { useCapabilities } from 'wagmi/experimental';

import { apiGetSafeTransactions } from 'api/calls/safeTransactions';
import env from 'env';
// import Deposits from 'hooks/contracts/abi/Deposits.json';
// import RegenStaker from 'hooks/contracts/abi/RegenStaker.json';
import useUnlock from 'hooks/mutations/useUnlock';
import useV2StakeMutation from 'hooks/mutations/useV2StakeMutation';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useHistory from 'hooks/queries/useHistory';
import useIsGnosisSafeMultisig from 'hooks/queries/useIsGnosisSafeMultisig';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useTransactionLocalStore from 'store/transactionLocal/store';

type ActionAfterUnlock = 'deposit_in_v2' | 'redirect_to_v2';

export default function useMigrateDepositToV2({
  actionAfterUnlock,
  options,
}: {
  actionAfterUnlock: ActionAfterUnlock;
  options?: UseMutationOptions<TransactionReceipt | null, unknown, unknown>;
}): UseMutationResult<TransactionReceipt | null, Error, void, unknown> {
  const {
    contractGlmAddress,
    // contractDepositsAddress,
    // contractRegenStakerAddress,
    regenStakerUrl,
  } = env;
  const {
    address,
    // chainId
  } = useAccount();
  const { data: isGnosisSafeMultisig } = useIsGnosisSafeMultisig();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchEstimatedEffectiveDeposit } = useEstimatedEffectiveDeposit();
  const { mutateAsync: stakeMutationAsync } = useV2StakeMutation();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchHistory } = useHistory();
  const [intervalId, setIntervalId] = useState<null | NodeJS.Timeout>(null);
  const { addTransactionPending } = useTransactionLocalStore(state => ({
    addTransactionPending: state.addTransactionPending,
  }));

  // const { data: capabilities } = useCapabilities({ account: address });
  // const { data: connectorClient } = useConnectorClient();

  const handleAsyncSuccess = async ({
    hash,
    value,
    type,
  }: {
    hash: Hash;
    type: 'unlock' | 'migrate';
    value: bigint;
  }): Promise<void> => {
    if (isGnosisSafeMultisig) {
      const id = setInterval(async () => {
        const nextSafeTransactions = await apiGetSafeTransactions(address!);
        const safeTransaction = nextSafeTransactions.results.find(
          t => t.safeTxHash === hash && t.transactionHash,
        );

        if (safeTransaction) {
          clearInterval(id);
          Promise.all([
            refetchDeposit(),
            refetchEstimatedEffectiveDeposit(),
            refetchLockedSummaryLatest(),
            refetchHistory(),
          ]);
        }
      }, 2000);
      setIntervalId(id);
      return;
    }
    addTransactionPending({
      eventData: {
        amount: value,
        transactionHash: hash,
      },
      isMultisig: !!isGnosisSafeMultisig,
      // GET /history uses seconds. Normalization here.
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: type === 'migrate' ? 'unlock' : type,
    });
  };

  const onSuccess = async ({ hash, value }): Promise<void> => {
    handleAsyncSuccess({ hash, type: 'unlock', value });
  };

  useEffect(() => {
    return () => {
      if (!intervalId) {
        return;
      }
      clearInterval(intervalId);
    };
  }, [intervalId]);

  const unlockMutation = useUnlock({ onSuccess });

  return useMutation<TransactionReceipt | null, Error, void, unknown>({
    mutationFn: async () => {
      if (!depositsValue) {
        throw new Error('depositsValue is undefined');
      }

      // Ensure we reset state and properly propagate any error so react-query exposes it
      try {

        /**
         * Logic for batch migration transactions.
         * Removed due to MetaMask warning strongly against it,
         * forcing users to 2-3 confirmations of that.
         */
        // const isAtomicBatchSupported =
        //   chainCapabilities?.atomic?.status === 'supported' || !!chainCapabilities?.atomic?.enabled;
        // const chainCapabilities = chainId ? capabilities?.[chainId] : undefined;
        //
        // if (
        //   chainId &&
        //   isAtomicBatchSupported &&
        //   actionAfterUnlock !== 'redirect_to_v2' &&
        //   !isGnosisSafeMultisig &&
        //   connectorClient
        // ) {
        //   const calls = [
        //     {
        //       abi: Deposits.abi,
        //       address: contractDepositsAddress as Hash,
        //       args: [depositsValue],
        //       functionName: 'unlock',
        //     },
        //     {
        //       abi: erc20Abi,
        //       address: contractGlmAddress as Hash,
        //       args: [contractRegenStakerAddress as Hash, depositsValue],
        //       functionName: 'approve',
        //     },
        //     {
        //       abi: RegenStaker.abi,
        //       address: contractRegenStakerAddress as Hash,
        //       args: [depositsValue, address!],
        //       functionName: 'stake',
        //     },
        //   ].map(call => ({
        //     // @ts-expect-error string to enum mapping.
        //     data: encodeFunctionData(call),
        //     to: call.address,
        //   }));
        //
        //   const callId = (await connectorClient.request(
        //     {
        //       method: 'wallet_sendCalls',
        //       params: [
        //         {
        //           atomicRequired: true,
        //           calls,
        //           chainId: numberToHex(chainId),
        //           from: address!,
        //           version: '2.0.0',
        //         },
        //       ],
        //     } as any,
        //     { retryCount: 0 },
        //   )) as string;
        //
        //   await handleAsyncSuccess({
        //     hash: callId as Hash,
        //     type: 'migrate',
        //     value: depositsValue,
        //   });
        //   return null;
        // }

        await unlockMutation.mutateAsync(depositsValue);

        if (actionAfterUnlock === 'redirect_to_v2') {
          window.open(regenStakerUrl, '_blank');
          return null;
        }

        return await stakeMutationAsync({
          depositAmount: depositsValue,
          stakeTokenAddress: contractGlmAddress as Hash,
        });
      } catch (err) {
        // Clear any polling interval if present and ensure error is propagated
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        // Rethrow as Error so react-query exposes it to the caller
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Migration to V2 failed');
      } finally {
        // Best-effort cleanup of interval on normal completion as well
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      }
    },
    ...options,
  });
}
