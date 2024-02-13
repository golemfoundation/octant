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

    expect(useAllocationsStore.getState().meta.isInitialized).toEqual(false);
    setAllocations(allocations);
    expect(useAllocationsStore.getState().meta.isInitialized).toEqual(true);
    expect(useAllocationsStore.getState().data.allocations).toEqual(allocations);
    reset();
    expect(useAllocationsStore.getState().data.allocations).toEqual([]);
  });

  it('should add allocations in localStorage and state', () => {
    const { addAllocations, setAllocations } = useAllocationsStore.getState();
    const allocations = ['address1', 'address2', 'address3'];

    expect(useAllocationsStore.getState().data.allocations).toEqual([]);
    setAllocations(allocations);
    expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toEqual(JSON.stringify(allocations));
    expect(useAllocationsStore.getState().data.allocations).toEqual(allocations);

    const newAllocations = ['address4', 'address5'];
    addAllocations(newAllocations);
    expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toEqual(
      JSON.stringify([...allocations, ...newAllocations]),
    );
    expect(useAllocationsStore.getState().data.allocations).toEqual([
      ...allocations,
      ...newAllocations,
    ]);
  });

  it('should remove allocations in localStorage and state', () => {
    const { removeAllocations, setAllocations } = useAllocationsStore.getState();
    const allocations = ['address1', 'address2', 'address3'];

    expect(useAllocationsStore.getState().data.allocations).toEqual([]);
    setAllocations(allocations);
    expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toEqual(JSON.stringify(allocations));
    expect(useAllocationsStore.getState().data.allocations).toEqual(allocations);

    const newAllocations = ['address3', 'address2'];
    removeAllocations(newAllocations);
    expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toEqual(JSON.stringify(['address1']));
    expect(useAllocationsStore.getState().data.allocations).toEqual(['address1']);
  });

  it('should set allocations in localStorage and state', () => {
    const { setAllocations } = useAllocationsStore.getState();
    const allocations = ['address1', 'address2', 'address3'];

    expect(useAllocationsStore.getState().data.allocations).toEqual([]);
    setAllocations(allocations);
    expect(localStorage.getItem(ALLOCATION_ITEMS_KEY)).toEqual(JSON.stringify(allocations));
    expect(useAllocationsStore.getState().data.allocations).toEqual(allocations);
  });
});
