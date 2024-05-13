export interface OnboardingData {
  hasOnboardingBeenClosed: boolean;
  isOnboardingDone: boolean;
  isOnboardingModalOpen: boolean;
  lastSeenStep: number;
}

export interface OnboardingMethods {
  reset: () => void;
  setHasOnboardingBeenClosed: (payload: OnboardingData['hasOnboardingBeenClosed']) => void;
  setIsOnboardingDone: (payload: OnboardingData['isOnboardingDone']) => void;
  setIsOnboardingModalOpen: (payload: OnboardingData['isOnboardingModalOpen']) => void;
  setLastSeenStep: (payload: OnboardingData['lastSeenStep']) => void;
  setValuesFromLocalStorage: () => void;
}
