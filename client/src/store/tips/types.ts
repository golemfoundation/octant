export interface TipsData {
  wasAddFavouritesAlreadyClosed: boolean;
  wasChangedYourMindAlreadyClosed: boolean;
  wasCheckStatusAlreadyClosed: boolean;
  wasConnectWalletAlreadyClosed: boolean;
  wasLockGLMAlreadyClosed: boolean;
  wasRewardsAlreadyClosed: boolean;
  wasWithdrawAlreadyClosed: boolean;
}

export interface TipsMethods {
  reset: () => void;
  setValuesFromLocalStorage: () => void;
  setWasAddFavouritesAlreadyClosed: (payload: TipsData['wasAddFavouritesAlreadyClosed']) => void;
  setWasChangedYourMindAlreadyClosed: (
    payload: TipsData['wasChangedYourMindAlreadyClosed'],
  ) => void;
  setWasCheckStatusAlreadyClosed: (payload: TipsData['wasCheckStatusAlreadyClosed']) => void;
  setWasConnectWalletAlreadyClosed: (payload: TipsData['wasConnectWalletAlreadyClosed']) => void;
  setWasLockGLMAlreadyClosed: (payload: TipsData['wasLockGLMAlreadyClosed']) => void;
  setWasRewardsAlreadyClosed: (payload: TipsData['wasRewardsAlreadyClosed']) => void;
  setWasWithdrawAlreadyClosed: (payload: TipsData['wasWithdrawAlreadyClosed']) => void;
}
