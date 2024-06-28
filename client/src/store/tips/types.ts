export interface TipsData {
  wasAddFavouritesAlreadyClosed: boolean;
  wasAllocateRewardsAlreadyClosed: boolean;
  wasConnectWalletAlreadyClosed: boolean;
  wasLockGLMAlreadyClosed: boolean;
  wasRewardsAlreadyClosed: boolean;
  wasUqTooLowAlreadyClosed: boolean;
  wasWithdrawAlreadyClosed: boolean;
}

export interface TipsMethods {
  setInitialState: () => void;
  setValuesFromLocalStorage: () => void;
  setWasAddFavouritesAlreadyClosed: (payload: TipsData['wasAddFavouritesAlreadyClosed']) => void;
  setWasAllocateRewardsAlreadyClosed: (
    payload: TipsData['wasAllocateRewardsAlreadyClosed'],
  ) => void;
  setWasConnectWalletAlreadyClosed: (payload: TipsData['wasConnectWalletAlreadyClosed']) => void;
  setWasLockGLMAlreadyClosed: (payload: TipsData['wasLockGLMAlreadyClosed']) => void;
  setWasRewardsAlreadyClosed: (payload: TipsData['wasRewardsAlreadyClosed']) => void;
  setWasUqTooLowAlreadyClosed: (payload: TipsData['wasUqTooLowAlreadyClosed']) => void;
  setWasWithdrawAlreadyClosed: (payload: TipsData['wasWithdrawAlreadyClosed']) => void;
}
