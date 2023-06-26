import { BigNumber } from 'ethers';

import { ALLOCATION_ITEMS_KEY, ALLOCATION_REWARDS_FOR_PROPOSALS } from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { AllocationsMethods, AllocationsData } from './types';

export const initialState: AllocationsData = {
  allocations: [],
  rewardsForProposals: BigNumber.from(0),
};

export default getStoreWithMeta<AllocationsData, AllocationsMethods>({
  getStoreMethods: set => ({
    addAllocations: payload => {
      set(state => {
        const newAllocations = state.data.allocations
          ? [...state.data.allocations, ...payload]
          : [...payload];
        localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newAllocations));
        return { data: { ...state.data, allocations: newAllocations } };
      });
    },
    reset: () => set({ data: initialState }),
    setAllocations: payload => {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(payload));
      set(state => ({
        data: { ...state.data, allocations: payload },
        meta: { isInitialized: true },
      }));
    },
    setRewardsForProposals: payload => {
      localStorage.setItem(ALLOCATION_REWARDS_FOR_PROPOSALS, JSON.stringify(payload));
      set(state => ({
        data: {
          ...state.data,
          rewardsForProposals: payload,
        },
      }));
    },
  }),
  initialState,
});
