export interface SettingsData {
  areOctantTipsAlwaysVisible: boolean;
  calculatingUQScoreMode: 'score' | 'sign';
  delegationPrimaryAddress?: string;
  delegationSecondaryAddress?: string;
  displayCurrency: 'usd' | 'aud' | 'eur' | 'jpy' | 'cny' | 'gbp';
  isAllocateOnboardingAlwaysVisible: boolean;
  isCryptoMainValueDisplay: boolean;
  isDelegationCalculatingUQScoreModalOpen: boolean;
  isDelegationCompleted: boolean;
  isDelegationConnectModalOpen: boolean;
  isDelegationInProgress: boolean;
  primaryAddressScore?: number;
  secondaryAddressScore?: number;
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
  setIsDelegationCompleted: (payload: SettingsData['isDelegationCompleted']) => void;
  setIsDelegationConnectModalOpen: (payload: SettingsData['isDelegationConnectModalOpen']) => void;
  setIsDelegationInProgress: (payload: SettingsData['isDelegationInProgress']) => void;
  setPrimaryAddressScore: (payload: SettingsData['primaryAddressScore']) => void;
  setSecondaryAddressScore: (payload: SettingsData['secondaryAddressScore']) => void;
  setValuesFromLocalStorage: () => void;
}
