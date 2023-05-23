export interface OnboardingData {
  isOnboardingDone: boolean;
}

export interface OnboardingMethods {
  reset: () => void;
  setIsOnboardingDone: (payload: OnboardingData['isOnboardingDone']) => void;
  setValuesFromLocalStorage: () => void;
}
