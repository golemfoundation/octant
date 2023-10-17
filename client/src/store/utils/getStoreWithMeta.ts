import { create, UseBoundStore, StoreApi, SetState } from 'zustand';

type StoreWithIsInitialized<StoreData, StoreMethods> = {
  data: StoreData;
  meta: {
    isInitialized: boolean;
  };
  reset: () => void;
} & StoreMethods;

export function getStoreWithMeta<StoreData, StoreMethods>({
  initialState,
  getStoreMethods,
}: {
  getStoreMethods: (
    set: SetState<StoreWithIsInitialized<StoreData, StoreMethods>>,
    get: () => StoreWithIsInitialized<StoreData, StoreMethods>,
  ) => StoreMethods;
  initialState: StoreData;
}): UseBoundStore<StoreApi<StoreWithIsInitialized<StoreData, StoreMethods>>> {
  return create<StoreWithIsInitialized<StoreData, StoreMethods>>((set, get) => ({
    data: initialState,
    meta: {
      isInitialized: false,
    },
    ...getStoreMethods(set, get),
    // @ts-expect-error Unknown types error.
    reset: () => set({ data: initialState, meta: { isInitialized: false } }),
  }));
}
