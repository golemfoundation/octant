import { ALLOCATION_ITEMS_KEY, ALLOCATION_REWARDS_FOR_PROJECTS } from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { AllocationsMethods, AllocationsData } from './types';

export const initialState: AllocationsData = {
  allocations: [],
  currentView: 'edit',
  rewardsForProjects: BigInt(0),
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
    removeAllocations: payload => {
      set(state => {
        if (state.data.allocations.length === 0) {
          return { data: { ...state.data } };
        }
        const newAllocations = state.data.allocations.filter(element => !payload.includes(element));
        localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newAllocations));
        return { data: { ...state.data, allocations: newAllocations } };
      });
    },
    setAllocations: payload => {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(payload));
      set(state => ({
        data: { ...state.data, allocations: payload },
        meta: { isInitialized: true },
      }));
    },
    setCurrentView: payload => {
      set(state => ({
        data: {
          ...state.data,
          currentView: payload,
        },
      }));
    },
    setRewardsForProjects: payload => {
      localStorage.setItem(ALLOCATION_REWARDS_FOR_PROJECTS, JSON.stringify(payload.toString()));
      set(state => ({
        data: {
          ...state.data,
          rewardsForProjects: payload,
        },
      }));
    },
  }),
  initialState,
});
