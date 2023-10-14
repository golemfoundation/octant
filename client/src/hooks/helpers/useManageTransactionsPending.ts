import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useWithdrawableRewards from 'hooks/queries/useWithdrawableRewards';
import useBlockNumber from 'hooks/subgraph/useBlockNumber';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useMetaStore, { initialState as metaInitialState } from 'store/meta/store';

export default function useManageTransactionsPending(): void {
  const publicClient = usePublicClient();
  const {
    blockNumberWithLatestTx,
    transactionsPending,
    setTransactionIsWaitingForTransaction,
    updateTransactionHash,
    removeTransactionPending,
    setBlockNumberWithLatestTx,
  } = useMetaStore(state => ({
    blockNumberWithLatestTx: state.data.blockNumberWithLatestTx,
    removeTransactionPending: state.removeTransactionPending,
    setBlockNumberWithLatestTx: state.setBlockNumberWithLatestTx,
    setTransactionIsWaitingForTransaction: state.setTransactionIsWaitingForTransaction,
    transactionsPending: state.data.transactionsPending,
    updateTransactionHash: state.updateTransactionHash,
  }));

  const { data: currentEpoch } = useCurrentEpoch();
  const { data: blockNumber } = useBlockNumber(
    blockNumberWithLatestTx !== metaInitialState.blockNumberWithLatestTx,
  );

  const { refetch: refetchEstimatedEffectiveDeposit } = useEstimatedEffectiveDeposit();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchWithdrawableRewards } = useWithdrawableRewards();

  useEffect(() => {
    if (!transactionsPending) {
      return;
    }

    transactionsPending
      .filter(({ isWaitingForTransaction }) => !isWaitingForTransaction)
      .forEach(transaction => {
        setTransactionIsWaitingForTransaction(transaction.transactionHash);
        publicClient
          .waitForTransactionReceipt({
            hash: transaction.transactionHash,
            onReplaced: response => {
              updateTransactionHash({
                newHash: response.transactionReceipt.transactionHash,
                oldHash: transaction.transactionHash,
              });
            },
          })
          .then(transactionReceipt => {
            removeTransactionPending(transactionReceipt.transactionHash);
            const transactionReceiptBlockNumber = Number(transactionReceipt.blockNumber);
            if (
              !blockNumberWithLatestTx ||
              blockNumberWithLatestTx < transactionReceiptBlockNumber
            ) {
              setBlockNumberWithLatestTx(transactionReceiptBlockNumber);
            }
          });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsPending?.length]);

  useEffect(() => {
    /**
     * Locking and unlocking GLMs require updating history and effective deposit.
     * Both these values are coming from backend, which takes them from subgraph (history - always, effective deposit only during epoch 1).
     *
     * Withdrawing ETH require updating withdrawable funds.
     * This values comes from backend, which takes this data from subgraph.
     *
     * The problem is that value in subgraph (and consequently in the backend)
     * is updated only after block is indexed in the subgraph.
     *
     * So, after lock, unlock or withdraw is done, blockNumberWithLatestTx is set to the value from transaction,
     * polling starts in useBlockNumber hook and after the number of block changes,
     * refetches are triggered and blockNumberWithLatestTx to null.
     */
    if (blockNumber && blockNumberWithLatestTx && blockNumber > blockNumberWithLatestTx) {
      refetchLockedSummaryLatest();
      refetchDeposit();
      refetchEstimatedEffectiveDeposit();
      refetchWithdrawableRewards();

      setBlockNumberWithLatestTx(metaInitialState.blockNumberWithLatestTx);
    }
  }, [
    currentEpoch,
    blockNumber,
    setBlockNumberWithLatestTx,
    blockNumberWithLatestTx,
    refetchDeposit,
    refetchLockedSummaryLatest,
    refetchEstimatedEffectiveDeposit,
    refetchWithdrawableRewards,
  ]);
}
