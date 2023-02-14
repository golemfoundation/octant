import { IS_ONBOARDING_DONE } from 'constants/localStorageKeys';
import { createActions } from 'store/utils/createActions';

import { defaultValuesFromLocalStorageSet, setIsOnboardingDone } from './actions';
import { OnboardingStore } from './types';

export const initialState: OnboardingStore = {
  isOnboardingDone: undefined,
};

const onboardingReducer = createActions<OnboardingStore>(
  handleActions => [
    handleActions(setIsOnboardingDone, (_state, { payload }) => ({
      isOnboardingDone: payload,
    })),
    handleActions(defaultValuesFromLocalStorageSet, () => ({
      isOnboardingDone: localStorage.getItem(IS_ONBOARDING_DONE) === 'true',
    })),
  ],
  initialState,
);

export default onboardingReducer;
