import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';
import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { AllocationsMethods, AllocationsData } from './types';

export const initialState: AllocationsData = {
  allocations: [],
};

export default getStoreWithMeta<AllocationsData, AllocationsMethods>({
  getStoreMethods: set => ({
    addAllocations: payload => {
      set(state => {
        const newAllocations = state.data.allocations
          ? [...state.data.allocations, ...payload]
          : [...payload];
        localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(newAllocations));
        return { data: { allocations: newAllocations } };
      });
    },
    reset: () => set({ data: initialState }),
    setAllocations: payload => {
      localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(payload));
      set({ data: { allocations: payload }, meta: { isInitialized: true } });
    },
  }),
  initialState,
});
