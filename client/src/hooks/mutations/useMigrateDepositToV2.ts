import { UseMutationResult, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { TransactionReceipt, Hash } from 'viem';
import { useAccount } from 'wagmi';

import { apiGetSafeTransactions } from 'api/calls/safeTransactions';
import env from 'env';
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
}: {
  actionAfterUnlock: ActionAfterUnlock;
}): UseMutationResult<TransactionReceipt | null, Error, void, unknown> {
  const { contractGlmAddress, regenStakerUrl } = env;
  const { address } = useAccount();
  const { data: isGnosisSafeMultisig } = useIsGnosisSafeMultisig();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchEstimatedEffectiveDeposit } = useEstimatedEffectiveDeposit();
  const { mutateAsync: stakeMutationAsync } = useV2StakeMutation();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchHistory } = useHistory();
  const [intervalId, setIntervalId] = useState<null | NodeJS.Timeout>(null);
  const [isSafeReady, setIsSafeReady] = useState(false);
  const { addTransactionPending } = useTransactionLocalStore(state => ({
    addTransactionPending: state.addTransactionPending,
  }));

  const onSuccess = async ({ hash, value }): Promise<void> => {
    if (isGnosisSafeMultisig) {
      const id = setInterval(async () => {
        const nextSafeTransactions = await apiGetSafeTransactions(address!);
        const safeTransaction = nextSafeTransactions.results.find(
          t => t.safeTxHash === hash && t.transactionHash,
        );

        if (safeTransaction) {
          clearInterval(id);
          setIsSafeReady(true);
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
      type: 'unlock',
    });
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

      // helper: wait until predicate returns true or time out
      const waitUntil = async (
        predicate: () => boolean,
        { intervalMs = 1000, timeoutMs = 180000 }: { intervalMs?: number; timeoutMs?: number } = {},
      ): Promise<void> =>
        new Promise((resolve, reject) => {
          const start = Date.now();
          const tick = (): void => {
            try {
              if (predicate()) {
                resolve();
                return;
              }
            } catch (e) {
              reject(e);
              return;
            }
            if (Date.now() - start >= timeoutMs) {
              reject(new Error('Timed out waiting for condition'));
              return;
            }
            setTimeout(tick, intervalMs);
          };
          setTimeout(tick, intervalMs);
        });

      // Reset safe readiness flag before starting a new flow
      setIsSafeReady(false);

      await unlockMutation.mutateAsync(depositsValue);

      if (isGnosisSafeMultisig) {
        // For multisig: proceed only after Safe tx has an on-chain transaction hash (set in onSuccess)
        await waitUntil(() => isSafeReady);
      } else {
        // For EOA: wait until the app finishes indexing the unlock (flag flips to false)
        await waitUntil(
          () => !useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed,
        );
      }

      if (actionAfterUnlock === 'redirect_to_v2') {
        window.open(regenStakerUrl, '_blank');
        return null;
      }

      return stakeMutationAsync({
        depositAmount: depositsValue,
        stakeTokenAddress: contractGlmAddress as Hash,
      });
    },
  });
}
