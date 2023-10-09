import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
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

  const { refetch: refetchDepositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchDeposit } = useDepositValue();

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
     * The problem is that value in subgraph (and consequently in the backend)
     * is updated only after block is indexed in the subgraph.
     *
     * So, after lock / unlock is done, blockNumberWithLatestTx is set to the value from transaction,
     * polling starts in useBlockNumber hook and after the number
     * of block changes, refetchHistory and refetchDepositEffectiveAtCurrentEpoch
     * is triggered and blockNumberWithLatestTx to null.
     */
    if (blockNumber && blockNumberWithLatestTx && blockNumber > blockNumberWithLatestTx) {
      refetchLockedSummaryLatest();
      refetchDeposit();

      if (currentEpoch === 1) {
        refetchDepositEffectiveAtCurrentEpoch();
      }

      setBlockNumberWithLatestTx(metaInitialState.blockNumberWithLatestTx);
    }
  }, [
    currentEpoch,
    blockNumber,
    setBlockNumberWithLatestTx,
    blockNumberWithLatestTx,
    refetchDeposit,
    refetchDepositEffectiveAtCurrentEpoch,
    refetchLockedSummaryLatest,
  ]);
}
