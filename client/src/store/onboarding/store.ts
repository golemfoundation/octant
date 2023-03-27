import { create } from 'zustand';

import { IS_ONBOARDING_DONE } from 'constants/localStorageKeys';

import { OnboardingStore, OnboardingData } from './types';

const initialState: OnboardingData = {
  isOnboardingDone: undefined,
};

const useOnboardingStore = create<OnboardingStore>(set => ({
  data: initialState,
  reset: () => set({ data: initialState }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsOnboardingDone: payload => {
    localStorage.setItem(IS_ONBOARDING_DONE, JSON.stringify(payload));
    set({ data: { isOnboardingDone: payload } });
  },
  setValuesFromLocalStorage: () =>
    set({ data: { isOnboardingDone: localStorage.getItem(IS_ONBOARDING_DONE) === 'true' } }),
}));

export default useOnboardingStore;
