export interface SettingsData {
  areOctantTipsAlwaysVisible: boolean;
  calculatingUQScoreMode: 'score' | 'sign';
  delegationPrimaryAddress?: string;
  delegationSecondaryAddress?: string;
  displayCurrency: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible: boolean;
  isCryptoMainValueDisplay: boolean;
  isDelegationCalculatingUQScoreModalOpen: boolean;
  isDelegationConnectModalOpen: boolean;
  // delegation
  isDelegationInProgress: boolean;
}

export interface SettingsMethods {
  reset: () => void;
  setAreOctantTipsAlwaysVisible: (payload: SettingsData['areOctantTipsAlwaysVisible']) => void;
  setCalculatingUQScoreMode: (payload: SettingsData['calculatingUQScoreMode']) => void;
  setDelegationPrimaryAddress: (payload: SettingsData['delegationPrimaryAddress']) => void;
  setDelegationSecondaryAddress: (payload: SettingsData['delegationSecondaryAddress']) => void;
  setDisplayCurrency: (payload: SettingsData['displayCurrency']) => void;
  setIsAllocateOnboardingAlwaysVisible: (
    payload: SettingsData['isAllocateOnboardingAlwaysVisible'],
  ) => void;
  setIsCryptoMainValueDisplay: (payload: SettingsData['isCryptoMainValueDisplay']) => void;
  setIsDelegationCalculatingUQScoreModalOpen: (
    payload: SettingsData['isDelegationCalculatingUQScoreModalOpen'],
  ) => void;
  setIsDelegationConnectModalOpen: (payload: SettingsData['isDelegationConnectModalOpen']) => void;
  // delegation
  setIsDelegationInProgress: (payload: SettingsData['isDelegationInProgress']) => void;
  setValuesFromLocalStorage: () => void;
}
