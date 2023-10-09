import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { MetaData, MetaMethods } from './types';

export const initialState: MetaData = {
  blockNumberWithLatestTx: null,
  isAppWaitingForTransactionToBeIndexed: false,
  transactionsPending: null,
};

export default getStoreWithMeta<MetaData, MetaMethods>({
  getStoreMethods: (set, get) => ({
    addTransactionPending: payload => {
      set(state => {
        const newTransactionsPending = state.data.transactionsPending
          ? [...state.data.transactionsPending, { ...payload, isWaitingForTransaction: false }]
          : [{ ...payload, isWaitingForTransaction: false }];
        return {
          data: { ...state.data, transactionsPending: newTransactionsPending },
        };
      });
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
    removeTransactionPending: payload => {
      set(state => {
        const transactionsPendingFiltered =
          state.data.transactionsPending?.filter(
            transaction => transaction.transactionHash !== payload,
          ) || [];
        const newTransactionsPending =
          transactionsPendingFiltered.length === 0
            ? initialState.transactionsPending
            : transactionsPendingFiltered;
        return {
          data: { ...state.data, transactionsPending: newTransactionsPending },
        };
      });
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
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
        get().data.transactionsPending !== initialState.transactionsPending;
      set(state => ({
        data: {
          ...state.data,
          isAppWaitingForTransactionToBeIndexed:
            isBlockNumberWithLatestTxSet || isTransactionHashesToWaitForSet,
        },
      }));
    },
    setTransactionIsWaitingForTransaction: payload => {
      set(state => {
        const newTransactionsPending = state.data.transactionsPending
          ? [...state.data.transactionsPending]
          : initialState.transactionsPending;
        if (newTransactionsPending) {
          newTransactionsPending.find(
            ({ transactionHash }) => transactionHash === payload,
          )!.isWaitingForTransaction = true;
        }
        return {
          data: { ...state.data, transactionsPending: newTransactionsPending },
        };
      });
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
    setTransactionsPending: payload => {
      set(state => ({
        data: { ...state.data, transactionsPending: payload },
      }));
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
    updateTransactionHash: ({ oldHash, newHash }) => {
      set(state => {
        const newTransactionsPending = state.data.transactionsPending
          ? [...state.data.transactionsPending]
          : initialState.transactionsPending;
        if (newTransactionsPending) {
          newTransactionsPending.find(
            ({ transactionHash }) => transactionHash === oldHash,
          )!.transactionHash = newHash;
        }
        return {
          data: { ...state.data, transactionsPending: newTransactionsPending },
        };
      });
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
  }),
  initialState,
});
