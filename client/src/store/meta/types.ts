import { Hash } from 'viem';

import { HistoryItemProps } from 'hooks/queries/useHistory';

export type TransactionPending = HistoryItemProps & {
  hash: Hash;
  isFetching: boolean;
};

export interface MetaData {
  blockNumberWithLatestTx: number | null;
  isAppWaitingForTransactionToBeIndexed: boolean;
  transactionsPending: null | TransactionPending[];
}

export interface MetaMethods {
  addTransactionPending: (payload: Omit<TransactionPending, 'isFetching'>) => void;
  removeTransactionPending: (hash: Hash) => void;
  reset: () => void;
  setBlockNumberWithLatestTx: (payload: MetaData['blockNumberWithLatestTx']) => void;
  setIsAppWaitingForTransactionToBeIndexed: () => void;
  setTransactionIsFetching: (payload: Hash) => void;
  setTransactionsPending: (payload: MetaData['transactionsPending']) => void;
  updateTransactionHash: (payload: { newHash: Hash; oldHash: Hash }) => void;
}
