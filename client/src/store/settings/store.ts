import {
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  ARE_OCTANT_TIPS_ALWAYS_VISIBLE,
  DELEGATION_PRIMARY_ADDRESS,
  DELEGATION_SECONDARY_ADDRESS,
  IS_DELEGATION_COMPLETED,
  PRIMARY_ADDRESS_SCORE,
  SECONDARY_ADDRESS_SCORE,
} from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { SettingsData, SettingsMethods } from './types';

export const initialState: SettingsData = {
  areOctantTipsAlwaysVisible: false,
  calculatingUQScoreMode: 'score',
  delegationPrimaryAddress: undefined,
  delegationSecondaryAddress: undefined,
  displayCurrency: 'usd',
  isAllocateOnboardingAlwaysVisible: false,
  isCryptoMainValueDisplay: true,
  isDelegationCalculatingUQScoreModalOpen: false,
  isDelegationCompleted: false,
  isDelegationConnectModalOpen: false,
  isDelegationInProgress: false,
  primaryAddressScore: 0,
  secondaryAddressScore: 0,
};

export default getStoreWithMeta<SettingsData, SettingsMethods>({
  getStoreMethods: set => ({
    reset: () => set({ data: initialState }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setAreOctantTipsAlwaysVisible: payload => {
      localStorage.setItem(ARE_OCTANT_TIPS_ALWAYS_VISIBLE, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, areOctantTipsAlwaysVisible: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setCalculatingUQScoreMode: payload => {
      set(state => ({ data: { ...state.data, calculatingUQScoreMode: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setDelegationPrimaryAddress: payload => {
      set(state => ({ data: { ...state.data, delegationPrimaryAddress: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setDelegationSecondaryAddress: payload => {
      set(state => ({ data: { ...state.data, delegationSecondaryAddress: payload } }));
    },

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
    setIsDelegationCalculatingUQScoreModalOpen: payload => {
      set(state => ({ data: { ...state.data, isDelegationCalculatingUQScoreModalOpen: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsDelegationCompleted: payload => {
      localStorage.setItem(IS_DELEGATION_COMPLETED, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, isDelegationCompleted: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsDelegationConnectModalOpen: payload => {
      set(state => ({ data: { ...state.data, isDelegationConnectModalOpen: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsDelegationInProgress: payload => {
      set(state => ({ data: { ...state.data, isDelegationInProgress: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setPrimaryAddressScore: payload => {
      localStorage.setItem(PRIMARY_ADDRESS_SCORE, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, primaryAddressScore: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setSecondaryAddressScore: payload => {
      localStorage.setItem(SECONDARY_ADDRESS_SCORE, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, secondaryAddressScore: payload } }));
    },

    setValuesFromLocalStorage: () =>
      set({
        data: {
          ...initialState,
          areOctantTipsAlwaysVisible: JSON.parse(
            localStorage.getItem(ARE_OCTANT_TIPS_ALWAYS_VISIBLE) || 'null',
          ),
          delegationPrimaryAddress: JSON.parse(
            localStorage.getItem(DELEGATION_PRIMARY_ADDRESS) || 'null',
          ),
          delegationSecondaryAddress: JSON.parse(
            localStorage.getItem(DELEGATION_SECONDARY_ADDRESS) || 'null',
          ),
          displayCurrency: JSON.parse(localStorage.getItem(DISPLAY_CURRENCY) || 'null'),
          isAllocateOnboardingAlwaysVisible: JSON.parse(
            localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE) || 'null',
          ),
          isCryptoMainValueDisplay: JSON.parse(
            localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY) || 'null',
          ),
          primaryAddressScore: JSON.parse(localStorage.getItem(PRIMARY_ADDRESS_SCORE) || '0'),
          secondaryAddressScore: JSON.parse(localStorage.getItem(SECONDARY_ADDRESS_SCORE) || '0'),
        },
        meta: {
          isInitialized: true,
        },
      }),
  }),
  initialState,
});
