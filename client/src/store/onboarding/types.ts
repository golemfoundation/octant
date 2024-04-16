export interface OnboardingData {
  isOnboardingDone: boolean;
  isOnboardingCompleted: boolean;
  lastSeenStep: number;
  isOnboardingModalOpen: boolean;
}

export interface OnboardingMethods {
  reset: () => void;
  setIsOnboardingDone: (payload: OnboardingData['isOnboardingDone']) => void;
  setIsOnboardingCompleted: (payload: OnboardingData['isOnboardingCompleted']) => void;
  setLastSeenStep: (payload: OnboardingData['lastSeenStep']) => void;
  setIsOnboardingModalOpen: (payload: OnboardingData['isOnboardingModalOpen']) => void;
  setValuesFromLocalStorage: () => void;
}
