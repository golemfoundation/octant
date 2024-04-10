import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useEstimatedEffectiveDeposit from 'hooks/queries/useEstimatedEffectiveDeposit';
import useWithdrawals from 'hooks/queries/useWithdrawals';
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
  const { refetch: refetchEstimatedEffectiveDeposit } = useEstimatedEffectiveDeposit();
  const { refetch: refetchDeposit } = useDepositValue();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchWithdrawals } = useWithdrawals();

  useEffect(() => {
    if (!transactionsPending) {
      return;
    }

    transactionsPending
      .filter(
        ({ isWaitingForTransactionInitialized, isMultisig }) =>
          !isWaitingForTransactionInitialized && !isMultisig,
      )
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
      refetchAvailableFundsGlm();
      refetchDeposit();
      refetchEstimatedEffectiveDeposit();
      refetchLockedSummaryLatest();
      refetchWithdrawals();

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
    refetchWithdrawals,
    setBlockNumberWithLatestTx,
  ]);
}
