import { Hash } from 'viem';

import { HistoryElement } from 'hooks/queries/useHistory';

export type TransactionPending = HistoryElement & {
  isFinalized: boolean;
  isMultisig?: boolean;
  isWaitingForTransactionInitialized: boolean;
  transactionHash: Hash;
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
  setTransactionIsFinalized: (payload: TransactionPending['transactionHash']) => void;
  setTransactionIsWaitingForTransactionInitialized: (
    payload: TransactionPending['transactionHash'],
  ) => void;
  updateTransactionHash: (payload: { newHash: Hash; oldHash: Hash }) => void;
}
