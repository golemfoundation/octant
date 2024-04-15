import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { TransactionLocalMethods, TransactionLocalData } from './types';

export const initialState: TransactionLocalData = {
  blockNumberWithLatestTx: null,
  isAppWaitingForTransactionToBeIndexed: false,
  transactionsPending: null,
};

export default getStoreWithMeta<TransactionLocalData, TransactionLocalMethods>({
  getStoreMethods: (set, get) => ({
    addTransactionPending: payload => {
      set(state => {
        const newTransactionsPending = state.data.transactionsPending
          ? [
              ...state.data.transactionsPending,
              { ...payload, isFinalized: false, isWaitingForTransactionInitialized: false },
            ]
          : [{ ...payload, isFinalized: false, isWaitingForTransactionInitialized: false }];
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
      /**
       * Transaction lifecycle:
       * 1. isWaitingForTransactionInitialized false & iFinalized false.
       * 2. isWaitingForTransactionInitialized true & iFinalized false.
       * 3. isWaitingForTransactionInitialized true & iFinalized true.
       *
       * Transaction has isWaitingForTransactionInitialized set true when fetch to chain is initiated.
       * It is never put down, to filter out transactions that we want to wait for.
       *
       * Transaction has isFinalized set true when it is finalized.
       *
       * We identify that there are some transactions being processed by an alterative of these two.
       */
      const areAnyTransactionsWaiting = !!get().data.transactionsPending?.some(
        ({ isWaitingForTransactionInitialized, isFinalized, isMultisig }) =>
          isWaitingForTransactionInitialized && !isFinalized && !isMultisig,
      );
      set(state => ({
        data: {
          ...state.data,
          isAppWaitingForTransactionToBeIndexed:
            isBlockNumberWithLatestTxSet || areAnyTransactionsWaiting,
        },
      }));
    },
    setTransactionIsFinalized: payload => {
      set(state => {
        if (!state.data.transactionsPending) {
          return {
            data: state.data,
          };
        }

        const newData = [...state.data.transactionsPending];

        const transactionToUpdateIndex = state.data.transactionsPending!.findIndex(
          ({ transactionHash }) => transactionHash === payload,
        );

        if (transactionToUpdateIndex > -1) {
          newData[transactionToUpdateIndex].isFinalized = true;
        }
        return {
          data: {
            ...state.data,
            transactionsPending: newData,
          },
        };
      });
      get().setIsAppWaitingForTransactionToBeIndexed();
    },
    setTransactionIsWaitingForTransactionInitialized: payload => {
      set(state => {
        if (!state.data.transactionsPending) {
          return {
            data: state.data,
          };
        }

        const newData = [...state.data.transactionsPending];

        const transactionToUpdateIndex = state.data.transactionsPending!.findIndex(
          ({ transactionHash }) => transactionHash === payload,
        );

        if (transactionToUpdateIndex > -1) {
          newData[transactionToUpdateIndex].isWaitingForTransactionInitialized = true;
        }
        return {
          data: {
            ...state.data,
            transactionsPending: newData,
          },
        };
      });
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
