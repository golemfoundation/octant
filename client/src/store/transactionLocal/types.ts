import { Hash } from 'viem';

import { HistoryElementBlockchainEventEvent } from 'hooks/queries/useHistory';

export type TransactionPending = HistoryElementBlockchainEventEvent & {
  isFinalized: boolean;
  isMultisig?: boolean;
  isWaitingForTransactionInitialized: boolean;
};

export interface TransactionLocalData {
  blockNumberWithLatestTx: number | null;
  isAppWaitingForTransactionToBeIndexed: boolean;
  transactionsPending: null | TransactionPending[];
}

export interface TransactionLocalMethods {
  addTransactionPending: (
    payload: Omit<TransactionPending, 'isWaitingForTransactionInitialized' | 'isFinalized'>,
  ) => void;
  removeTransactionPending: (hash: Hash) => void;
  reset: () => void;
  setBlockNumberWithLatestTx: (payload: TransactionLocalData['blockNumberWithLatestTx']) => void;
  setIsAppWaitingForTransactionToBeIndexed: () => void;
  setTransactionIsFinalized: (payload: TransactionPending['eventData']['transactionHash']) => void;
  setTransactionIsWaitingForTransactionInitialized: (
    payload: TransactionPending['eventData']['transactionHash'],
  ) => void;
  updateTransactionHash: (payload: { newHash: Hash; oldHash: Hash }) => void;
}
