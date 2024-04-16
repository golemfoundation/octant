import {
  IS_ONBOARDING_COMPLETED,
  IS_ONBOARDING_DONE,
  LAST_SEEN_STEP,
} from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { OnboardingMethods, OnboardingData } from './types';

export const initialState: OnboardingData = {
  isOnboardingDone: false,
  isOnboardingCompleted: false,
  lastSeenStep: 1,
  isOnboardingModalOpen: false,
};

export default getStoreWithMeta<OnboardingData, OnboardingMethods>({
  getStoreMethods: set => ({
    reset: () => set({ data: initialState }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsOnboardingDone: payload => {
      localStorage.setItem(IS_ONBOARDING_DONE, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, isOnboardingDone: payload } }));
    },
    setIsOnboardingCompleted: payload => {
      localStorage.setItem(IS_ONBOARDING_COMPLETED, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, isOnboardingCompleted: payload } }));
    },
    setLastSeenStep: payload => {
      localStorage.setItem(LAST_SEEN_STEP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, lastSeenStep: payload } }));
    },
    setIsOnboardingModalOpen: payload => {
      set(state => ({ data: { ...state.data, isOnboardingModalOpen: payload } }));
    },
    setValuesFromLocalStorage: () =>
      set(state => ({
        data: {
          isOnboardingDone: localStorage.getItem(IS_ONBOARDING_DONE) === 'true',
          isOnboardingCompleted: localStorage.getItem(IS_ONBOARDING_DONE) === 'true',
          lastSeenStep: parseInt(localStorage.getItem(LAST_SEEN_STEP) || '1', 10),
          isOnboardingModalOpen: state.data.isOnboardingModalOpen,
        },
        meta: {
          isInitialized: true,
        },
      })),
  }),
  initialState,
});
