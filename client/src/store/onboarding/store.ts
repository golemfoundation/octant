import { IS_ONBOARDING_DONE } from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { OnboardingMethods, OnboardingData } from './types';

export const initialState: OnboardingData = {
  isOnboardingDone: false,
};

export default getStoreWithMeta<OnboardingData, OnboardingMethods>({
  getStoreMethods: set => ({
    reset: () => set({ data: initialState }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsOnboardingDone: payload => {
      localStorage.setItem(IS_ONBOARDING_DONE, JSON.stringify(payload));
      set({ data: { isOnboardingDone: payload } });
    },
    setValuesFromLocalStorage: () =>
      set({
        data: {
          isOnboardingDone: localStorage.getItem(IS_ONBOARDING_DONE) === 'true',
        },
        meta: {
          isInitialized: true,
        },
      }),
  }),
  initialState,
});
