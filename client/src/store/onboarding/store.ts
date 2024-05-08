import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_DONE,
  LAST_SEEN_STEP,
} from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { OnboardingMethods, OnboardingData } from './types';

export const initialState: OnboardingData = {
  hasOnboardingBeenClosed: false,
  isOnboardingDone: false,
  isOnboardingModalOpen: false,
  lastSeenStep: 1,
};

export default getStoreWithMeta<OnboardingData, OnboardingMethods>({
  getStoreMethods: set => ({
    reset: () => set({ data: initialState }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setHasOnboardingBeenClosed: payload => {
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, hasOnboardingBeenClosed: payload } }));
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsOnboardingDone: payload => {
      localStorage.setItem(IS_ONBOARDING_DONE, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, isOnboardingDone: payload } }));
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsOnboardingModalOpen: payload => {
      set(state => ({ data: { ...state.data, isOnboardingModalOpen: payload } }));
    },
    setLastSeenStep: payload => {
      localStorage.setItem(LAST_SEEN_STEP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, lastSeenStep: payload } }));
    },
    setValuesFromLocalStorage: () =>
      set(state => ({
        data: {
          hasOnboardingBeenClosed: localStorage.getItem(HAS_ONBOARDING_BEEN_CLOSED) === 'true',
          isOnboardingDone: localStorage.getItem(IS_ONBOARDING_DONE) === 'true',
          isOnboardingModalOpen: state.data.isOnboardingModalOpen,
          lastSeenStep:
            localStorage.getItem(IS_ONBOARDING_DONE) === 'true'
              ? 1
              : parseInt(localStorage.getItem(LAST_SEEN_STEP) || '1', 10) || 1,
        },
        meta: {
          isInitialized: true,
        },
      })),
  }),
  initialState,
});
