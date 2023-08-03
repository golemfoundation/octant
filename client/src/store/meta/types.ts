export interface MetaData {
  blockNumberWithLatestTx: number | null;
}

export interface MetaMethods {
  setBlockNumberWithLatestTx: (payload: MetaData['blockNumberWithLatestTx']) => void;
}
