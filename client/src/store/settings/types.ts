export interface SettingsData {
  displayCurrency: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible: boolean;
  isCryptoMainValueDisplay: boolean;
  showHelpVideos: boolean;
}

export interface SettingsMethods {
  reset: () => void;
  setDisplayCurrency: (payload: SettingsData['displayCurrency']) => void;
  setIsAllocateOnboardingAlwaysVisible: (
    payload: SettingsData['isAllocateOnboardingAlwaysVisible'],
  ) => void;
  setIsCryptoMainValueDisplay: (payload: SettingsData['isCryptoMainValueDisplay']) => void;
  setShowHelpVideos: (payload: SettingsData['showHelpVideos']) => void;
  setValuesFromLocalStorage: () => void;
}
