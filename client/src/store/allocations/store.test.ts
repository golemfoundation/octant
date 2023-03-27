import { ALLOCATION_ITEMS_KEY } from 'constants/localStorageKeys';

import useAllocationsStore from './store';

describe('useAllocationsStore', () => {
  afterEach(() => {
    const { reset } = useAllocationsStore.getState();
    localStorage.clear();
    reset();
  });

  it('should reset the state', () => {
    const { setAllocations, reset } = useAllocationsStore.getState();
    const allocations = ['address1', 'address2', 'address3'];

    setAllocations(allocations);
    expect(useAllocationsStore.getState().data).toEqual(allocations);
    reset();
    expect(useAllocationsStore.getState().data).toEqual(null);
  });

  it('should set allocations in localStorage and state', () => {
    const { setAllocations } = useAllocationsStore.getState();
    const allocations = ['address1', 'address2', 'address3'];

    expect(useAllocationsStore.getState().data).toEqual(null);
    setAllocations(allocations);
    expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toEqual(JSON.stringify(allocations));
    expect(useAllocationsStore.getState().data).toEqual(allocations);
  });
});
