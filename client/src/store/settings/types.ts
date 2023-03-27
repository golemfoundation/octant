export interface SettingsData {
  allocateValueAdjusterUnit?: string;
  areMetricsIntroductionsVisible?: boolean;
  displayCurrency?: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible?: boolean;
  isCryptoMainValueDisplay?: boolean;
}

export interface SettingsStore {
  data: SettingsData;
  reset: () => void;
  setDisplayCurrency: (payload: SettingsData['displayCurrency']) => void;
  setIsAllocateOnboardingAlwaysVisible: (
    payload: SettingsData['isAllocateOnboardingAlwaysVisible'],
  ) => void;
  setIsCryptoMainValueDisplay: (payload: SettingsData['isCryptoMainValueDisplay']) => void;
  setValuesFromLocalStorage: () => void;
}
