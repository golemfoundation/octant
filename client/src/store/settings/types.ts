export interface SettingsData {
  displayCurrency: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible: boolean;
  isCryptoMainValueDisplay: boolean;
  isQuickTourVisible: boolean;
  showHelpVideos: boolean;
}

export interface SettingsMethods {
  reset: () => void;
  setDisplayCurrency: (payload: SettingsData['displayCurrency']) => void;
  setIsAllocateOnboardingAlwaysVisible: (
    payload: SettingsData['isAllocateOnboardingAlwaysVisible'],
  ) => void;
  setIsCryptoMainValueDisplay: (payload: SettingsData['isCryptoMainValueDisplay']) => void;
  setIsQuickTourVisible: (payload: SettingsData['isQuickTourVisible']) => void;
  setShowHelpVideos: (payload: SettingsData['showHelpVideos']) => void;
  setValuesFromLocalStorage: () => void;
}
