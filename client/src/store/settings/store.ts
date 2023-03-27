import { create } from 'zustand';

import {
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
} from 'constants/localStorageKeys';

import { SettingsStore, SettingsData } from './types';

const initialState: SettingsData = {
  allocateValueAdjusterUnit: undefined,
  areMetricsIntroductionsVisible: undefined,
  displayCurrency: undefined,
  isAllocateOnboardingAlwaysVisible: undefined,
  isCryptoMainValueDisplay: undefined,
};

const useSettingsStore = create<SettingsStore>(set => ({
  data: initialState,
  reset: () => set({ data: initialState }),
  setDisplayCurrency: payload => {
    localStorage.setItem(DISPLAY_CURRENCY, JSON.stringify(payload));
    set(state => ({ data: { ...state.data, displayCurrency: payload } }));
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsAllocateOnboardingAlwaysVisible: payload => {
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, JSON.stringify(payload));
    set(state => ({ data: { ...state.data, isAllocateOnboardingAlwaysVisible: payload } }));
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setIsCryptoMainValueDisplay: payload => {
    localStorage.setItem(IS_CRYPTO_MAIN_VALUE_DISPLAY, JSON.stringify(payload));
    set(state => ({ data: { ...state.data, isCryptoMainValueDisplay: payload } }));
  },
  setValuesFromLocalStorage: () =>
    set({
      data: {
        allocateValueAdjusterUnit: '50.0',
        areMetricsIntroductionsVisible: false,
        displayCurrency: JSON.parse(localStorage.getItem(DISPLAY_CURRENCY) || 'null'),
        isAllocateOnboardingAlwaysVisible: JSON.parse(
          localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE) || 'null',
        ),
        isCryptoMainValueDisplay: JSON.parse(
          localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY) || 'null',
        ),
      },
    }),
}));

export default useSettingsStore;
