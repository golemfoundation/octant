export interface MetaData {
  blockNumberWithLatestTx: number | null;
  isAppWaitingForTransactionToBeIndexed: boolean;
  transactionHashesToWaitFor: string[] | null;
}

export interface MetaMethods {
  reset: () => void;
  setBlockNumberWithLatestTx: (payload: MetaData['blockNumberWithLatestTx']) => void;
  setIsAppWaitingForTransactionToBeIndexed: () => void;
  setTransactionHashesToWaitFor: (payload: MetaData['transactionHashesToWaitFor']) => void;
}
