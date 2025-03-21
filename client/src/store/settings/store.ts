import {
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_QUICKTOUR_ALWAYS_VISIBLE,
  SHOW_HELP_VIDEOS,
} from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { SettingsData, SettingsMethods } from './types';

export const initialState: SettingsData = {
  displayCurrency: 'usd',
  isAllocateOnboardingAlwaysVisible: false,
  isCryptoMainValueDisplay: true,
  isQuickTourVisible: true,
  showHelpVideos: true,
};

export default getStoreWithMeta<SettingsData, SettingsMethods>({
  getStoreMethods: set => ({
    reset: () => set({ data: initialState }),

    // eslint-disable-next-line @typescript-eslint/naming-convention
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsQuickTourVisible: payload => {
      localStorage.setItem(IS_QUICKTOUR_ALWAYS_VISIBLE, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, isQuickTourVisible: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setShowHelpVideos: payload => {
      localStorage.setItem(SHOW_HELP_VIDEOS, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, showHelpVideos: payload } }));
    },

    setValuesFromLocalStorage: () =>
      set({
        data: {
          ...initialState,
          displayCurrency: JSON.parse(localStorage.getItem(DISPLAY_CURRENCY) || 'null'),
          isAllocateOnboardingAlwaysVisible: JSON.parse(
            localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE) || 'null',
          ),
          isCryptoMainValueDisplay: JSON.parse(
            localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY) || 'null',
          ),
          isQuickTourVisible: JSON.parse(
            localStorage.getItem(IS_QUICKTOUR_ALWAYS_VISIBLE) || 'null',
          ),
          showHelpVideos: JSON.parse(localStorage.getItem(SHOW_HELP_VIDEOS) || 'true'),
        },
        meta: {
          isInitialized: true,
        },
      }),
  }),
  initialState,
});
