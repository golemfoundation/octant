import { renderHook, act } from '@testing-library/react';

import { getStoreWithMeta } from './getStoreWithMeta';

// Mock implementation of getStoreMethods for testing
const getStoreMethods = (set: any) => ({
  setData: (data: any) => {
    set({ data });
  },
  setMeta: (meta: any) => {
    set({ meta });
  },
});

describe('getStoreWithMeta', () => {
  it('should return the correct initialState and useStore function', () => {
    const initialState = { count: 0 };
    const useStore = getStoreWithMeta({
      getStoreMethods,
      initialState,
    });

    expect(typeof useStore).toBe('function');
  });

  it('should create a store with the correct initial state and methods', () => {
    const initialState = { count: 0 };
    const useStore = getStoreWithMeta({
      getStoreMethods,
      initialState,
    });

    expect(typeof useStore).toBe('function');

    const { result } = renderHook(() => useStore());

    const { data, meta, setData, setMeta } = result.current;

    // Test initial state and methods
    expect(data).toEqual(initialState);
    expect(meta.isInitialized).toBe(false);
    expect(typeof setData).toBe('function');
    expect(typeof setMeta).toBe('function');

    // Test updating data
    act(() => {
      setData({ count: 5 });
    });
    expect(result.current.data).toEqual({ count: 5 });

    // Test updating meta
    act(() => {
      setMeta({ isInitialized: true });
    });
    expect(result.current.meta.isInitialized).toBe(true);
  });
});
