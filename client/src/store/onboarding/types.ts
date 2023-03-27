export interface OnboardingData {
  isOnboardingDone?: boolean;
}

export interface OnboardingStore {
  data: OnboardingData;
  reset: () => void;
  setIsOnboardingDone: (payload: OnboardingData['isOnboardingDone']) => void;
  setValuesFromLocalStorage: () => void;
}
