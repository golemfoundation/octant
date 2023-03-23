import {
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
} from 'constants/localStorageKeys';
import { createActions } from 'store/utils/createActions';

import {
  isAllocateOnboardingAlwaysVisibleSet,
  defaultValuesFromLocalStorageSet,
  displayCurrencySet,
  isCryptoMainValueDisplaySet,
} from './actions';
import { SettingsStore } from './types';

export const initialState: SettingsStore = {
  allocateValueAdjusterUnit: undefined,
  areMetricsIntroductionsVisible: undefined,
  displayCurrency: undefined,
  isAllocateOnboardingAlwaysVisible: undefined,
  isCryptoMainValueDisplay: undefined,
};

const settingsReducer = createActions<SettingsStore>(
  handleActions => [
    handleActions(isCryptoMainValueDisplaySet, (state, { payload }) => ({
      ...state,
      isCryptoMainValueDisplay: payload,
    })),
    handleActions(isAllocateOnboardingAlwaysVisibleSet, (state, { payload }) => ({
      ...state,
      isAllocateOnboardingAlwaysVisible: payload,
    })),
    handleActions(displayCurrencySet, (state, { payload }) => ({
      ...state,
      displayCurrency: payload,
    })),
    handleActions(defaultValuesFromLocalStorageSet, () => ({
      allocateValueAdjusterUnit: '50.0',
      areMetricsIntroductionsVisible: false,
      displayCurrency: JSON.parse(localStorage.getItem(DISPLAY_CURRENCY) || 'null'),
      isAllocateOnboardingAlwaysVisible: JSON.parse(
        localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE) || 'null',
      ),
      isCryptoMainValueDisplay: JSON.parse(
        localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY) || 'null',
      ),
    })),
  ],
  initialState,
);

export default settingsReducer;
