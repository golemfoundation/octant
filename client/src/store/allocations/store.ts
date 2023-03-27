import { create } from 'zustand';

import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';

import { AllocationsStore, AllocationsData } from './types';

const initialState: AllocationsData = null;

const useAllocationsStore = create<AllocationsStore>(set => ({
  data: initialState,
  reset: () => set({ data: initialState }),
  setAllocations: payload => {
    localStorage.setItem(ALLOCATION_ITEMS_KEY, JSON.stringify(payload));
    set({ data: payload });
  },
}));

export default useAllocationsStore;
