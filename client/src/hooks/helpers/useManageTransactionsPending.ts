import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useBlockNumber from 'hooks/subgraph/useBlockNumber';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useTransactionLocalStore, {
  initialState as metaInitialState,
} from 'store/transactionLocal/store';

import useAvailableFundsGlm from './useAvailableFundsGlm';

export default function useManageTransactionsPending(): void {
  const publicClient = usePublicClient();
  const {
    blockNumberWithLatestTx,
    transactionsPending,
    setTransactionIsWaitingForTransactionInitialized,
    updateTransactionHash,
    setTransactionIsFinalized,
    setBlockNumberWithLatestTx,
  } = useTransactionLocalStore(state => ({
    blockNumberWithLatestTx: state.data.blockNumberWithLatestTx,
    removeTransactionPending: state.removeTransactionPending,
    setBlockNumberWithLatestTx: state.setBlockNumberWithLatestTx,
    setTransactionIsFinalized: state.setTransactionIsFinalized,
    setTransactionIsWaitingForTransactionInitialized:
      state.setTransactionIsWaitingForTransactionInitialized,
    transactionsPending: state.data.transactionsPending,
    updateTransactionHash: state.updateTransactionHash,
  }));
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: blockNumber } = useBlockNumber(
    blockNumberWithLatestTx !== metaInitialState.blockNumberWithLatestTx,
  );
  const { refetch: refetchAvailableFundsGlm } = useAvailableFundsGlm();
  const { refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchEstimatedEffectiveDeposit } = useEstimatedEffectiveDeposit();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();

  useEffect(() => {
    if (!transactionsPending) {
      return;
    }

    transactionsPending
      .filter(({ isWaitingForTransactionInitialized }) => !isWaitingForTransactionInitialized)
      .forEach(transaction => {
        setTransactionIsWaitingForTransactionInitialized(transaction.transactionHash);
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
            setTransactionIsFinalized(transactionReceipt.transactionHash);
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
      refetchEstimatedEffectiveDeposit();
      refetchAvailableFundsGlm();

      setBlockNumberWithLatestTx(metaInitialState.blockNumberWithLatestTx);
    }
  }, [
    blockNumber,
    blockNumberWithLatestTx,
    currentEpoch,
    refetchAvailableFundsGlm,
    refetchDeposit,
    refetchEstimatedEffectiveDeposit,
    refetchLockedSummaryLatest,
    setBlockNumberWithLatestTx,
  ]);
}
