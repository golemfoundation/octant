export interface SettingsData {
  areOctantTipsAlwaysVisible: boolean;
  displayCurrency: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible: boolean;
  isCryptoMainValueDisplay: boolean;
}

export interface SettingsMethods {
  reset: () => void;
  setAreOctantTipsAlwaysVisible: (payload: SettingsData['areOctantTipsAlwaysVisible']) => void;
  setDisplayCurrency: (payload: SettingsData['displayCurrency']) => void;
  setIsAllocateOnboardingAlwaysVisible: (
    payload: SettingsData['isAllocateOnboardingAlwaysVisible'],
  ) => void;
  setIsCryptoMainValueDisplay: (payload: SettingsData['isCryptoMainValueDisplay']) => void;
  setValuesFromLocalStorage: () => void;
}
