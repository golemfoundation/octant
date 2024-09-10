import {
  DELEGATION_PRIMARY_ADDRESS,
  DELEGATION_SECONDARY_ADDRESS,
  IS_DELEGATION_COMPLETED,
  PRIMARY_ADDRESS_SCORE,
  SECONDARY_ADDRESS_SCORE,
} from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { DelegationData, DelegationMethods } from './types';

export const initialState: DelegationData = {
  calculatingUQScoreMode: 'score',
  delegationPrimaryAddress: undefined,
  delegationSecondaryAddress: undefined,
  isDelegationCalculatingUQScoreModalOpen: false,
  isDelegationCompleted: false,
  isDelegationConnectModalOpen: false,
  isDelegationInProgress: false,
  primaryAddressScore: undefined,
  secondaryAddressScore: undefined,
};

export default getStoreWithMeta<DelegationData, DelegationMethods>({
  getStoreMethods: set => ({
    reset: () => set({ data: initialState }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setCalculatingUQScoreMode: payload => {
      set(state => ({ data: { ...state.data, calculatingUQScoreMode: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setDelegationPrimaryAddress: payload => {
      localStorage.setItem(DELEGATION_PRIMARY_ADDRESS, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, delegationPrimaryAddress: payload } }));
    },

    // eslint-disable-next-line @typescript-eslint/naming-convention
    setDelegationSecondaryAddress: payload => {
      localStorage.setItem(DELEGATION_SECONDARY_ADDRESS, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, delegationSecondaryAddress: payload } }));
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
          delegationPrimaryAddress: JSON.parse(
            localStorage.getItem(DELEGATION_PRIMARY_ADDRESS) || 'null',
          ),
          delegationSecondaryAddress: JSON.parse(
            localStorage.getItem(DELEGATION_SECONDARY_ADDRESS) || 'null',
          ),
          isDelegationCompleted: JSON.parse(
            localStorage.getItem(IS_DELEGATION_COMPLETED) || 'false',
          ),
          primaryAddressScore: JSON.parse(localStorage.getItem(PRIMARY_ADDRESS_SCORE) || 'null'),
          secondaryAddressScore: JSON.parse(
            localStorage.getItem(SECONDARY_ADDRESS_SCORE) || 'null',
          ),
        },
        meta: {
          isInitialized: true,
        },
      }),
  }),
  initialState,
});
