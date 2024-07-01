import {
  WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP,
  WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP,
  WAS_LOCK_GLM_ALREADY_CLOSED_TIP,
  WAS_REWARDS_ALREADY_CLOSED_TIP,
  WAS_WITHDRAW_ALREADY_CLOSED_TIP,
  WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP,
  WAS_UQ_TOO_LOW_ALREADY_CLOSED_TIP,
} from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { TipsMethods, TipsData } from './types';

export const initialState: TipsData = {
  wasAddFavouritesAlreadyClosed: false,
  wasAllocateRewardsAlreadyClosed: false,
  wasConnectWalletAlreadyClosed: false,
  wasLockGLMAlreadyClosed: false,
  wasRewardsAlreadyClosed: false,
  wasUqTooLowAlreadyClosed: false,
  wasWithdrawAlreadyClosed: false,
};

export default getStoreWithMeta<TipsData, TipsMethods>({
  getStoreMethods: set => ({
    // TODO: https://linear.app/golemfoundation/issue/OCT-1056/reset-and-flush-stores
    setInitialState: () => set({ data: initialState }),
    setValuesFromLocalStorage: () =>
      set({
        data: {
          
          wasAddFavouritesAlreadyClosed: JSON.parse(
            localStorage.getItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP) || 'false',
          ),
          
wasAllocateRewardsAlreadyClosed: JSON.parse(
            localStorage.getItem(WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP) || 'false',
          ),
          
wasConnectWalletAlreadyClosed: JSON.parse(
            localStorage.getItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP) || 'false',
          ),
          
wasLockGLMAlreadyClosed: JSON.parse(
            localStorage.getItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP) || 'false',
          ),
          
wasRewardsAlreadyClosed: JSON.parse(
            localStorage.getItem(WAS_REWARDS_ALREADY_CLOSED_TIP) || 'false',
          ),
          /**
           * As per AC for OCT-1646 this tip tile disregards what is store in localStorage,
           * showing every time after refresh when other requirements are met.
           */
wasUqTooLowAlreadyClosed: false,
          wasWithdrawAlreadyClosed: JSON.parse(
            localStorage.getItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP) || 'false',
          ),
        },
        meta: {
          isInitialized: true,
        },
      }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setWasAddFavouritesAlreadyClosed: payload => {
      localStorage.setItem(WAS_ADD_FAVOURITES_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasAddFavouritesAlreadyClosed: payload } }));
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setWasAllocateRewardsAlreadyClosed: payload => {
      localStorage.setItem(WAS_ALLOCATE_REWARDS_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasAllocateRewardsAlreadyClosed: payload } }));
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setWasConnectWalletAlreadyClosed: payload => {
      localStorage.setItem(WAS_CONNECT_WALLET_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasConnectWalletAlreadyClosed: payload } }));
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setWasLockGLMAlreadyClosed: payload => {
      localStorage.setItem(WAS_LOCK_GLM_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasLockGLMAlreadyClosed: payload } }));
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setWasRewardsAlreadyClosed: payload => {
      localStorage.setItem(WAS_REWARDS_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasRewardsAlreadyClosed: payload } }));
    },
    
    // eslint-disable-next-line @typescript-eslint/naming-convention
setWasUqTooLowAlreadyClosed: payload => {
      localStorage.setItem(WAS_UQ_TOO_LOW_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasUqTooLowAlreadyClosed: payload } }));
    },
    
    // eslint-disable-next-line @typescript-eslint/naming-convention
setWasWithdrawAlreadyClosed: payload => {
      localStorage.setItem(WAS_WITHDRAW_ALREADY_CLOSED_TIP, JSON.stringify(payload));
      set(state => ({ data: { ...state.data, wasWithdrawAlreadyClosed: payload } }));
    },
  }),
  initialState,
});
