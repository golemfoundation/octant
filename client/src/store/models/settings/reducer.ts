import { IS_ONBOARDING_ALWAYS_VISIBLE } from 'constants/localStorageKeys';
import { createActions } from 'store/utils/createActions';

import { isAllocateOnboardingAlwaysVisibleSet, defaultValuesFromLocalStorageSet } from './actions';
import { SettingsStore } from './types';

export const initialState: SettingsStore = {
  allocateValueAdjusterUnit: undefined,
  areMetricsIntroductionsVisible: undefined,
  displayCurrency: undefined,
  isAllocateOnboardingAlwaysVisible: undefined,
  isEthMainValueDisplay: undefined,
};

const settingsReducer = createActions<SettingsStore>(
  handleActions => [
    handleActions(isAllocateOnboardingAlwaysVisibleSet, (state, { payload }) => ({
      ...state,
      isAllocateOnboardingAlwaysVisible: payload,
    })),
    handleActions(defaultValuesFromLocalStorageSet, () => ({
      allocateValueAdjusterUnit: '50.0',
      areMetricsIntroductionsVisible: false,
      displayCurrency: 'USD',
      isAllocateOnboardingAlwaysVisible:
        localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE) === 'true',
      isEthMainValueDisplay: false,
    })),
  ],
  initialState,
);

export default settingsReducer;
