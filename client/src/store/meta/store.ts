import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { MetaData, MetaMethods } from './types';

export const initialState: MetaData = {
  blockNumberWithLatestTx: null,
  isAppWaitingForTransactionToBeIndexed: false,
  transactionHashesToWaitFor: null,
};

export default getStoreWithMeta<MetaData, MetaMethods>({
  getStoreMethods: (set, get) => ({
    reset: () => set({ data: initialState }),
    setBlockNumberWithLatestTx: payload => {
      set(state => ({
        data: { ...state.data, blockNumberWithLatestTx: payload },
      }));
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsAppWaitingForTransactionToBeIndexed: () => {
      const isBlockNumberWithLatestTxSet =
        get().data.blockNumberWithLatestTx !== initialState.blockNumberWithLatestTx;
      const isTransactionHashesToWaitForSet =
        get().data.transactionHashesToWaitFor !== initialState.transactionHashesToWaitFor;
      set(state => ({
        data: {
          ...state.data,
          isAppWaitingForTransactionToBeIndexed:
            isBlockNumberWithLatestTxSet || isTransactionHashesToWaitForSet,
        },
      }));
    },
    setTransactionHashesToWaitFor: payload => {
      set(state => ({
        data: { ...state.data, transactionHashesToWaitFor: payload },
      }));
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
  }),
  initialState,
});
