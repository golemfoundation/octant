import { transactionPending1, transactionPending2, transactionPending3 } from 'mocks/history';

import useTransactionLocalStore, { initialState } from './store';

describe('useTransactionLocalStore', () => {
  afterEach(() => {
    const { reset } = useTransactionLocalStore.getState();
    localStorage.clear();
    reset();
  });

  it('initial state should be correct', () => {
    expect(useTransactionLocalStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );
  });

  it('should correctly addTransactionPending', () => {
    const { addTransactionPending } = useTransactionLocalStore.getState();

    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
    addTransactionPending(transactionPending1);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
    ]);
    addTransactionPending(transactionPending2);
    addTransactionPending(transactionPending3);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending2,
      transactionPending3,
    ]);
  });

  it('should correctly removeTransactionPending', () => {
    const { removeTransactionPending, addTransactionPending } = useTransactionLocalStore.getState();

    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
    addTransactionPending(transactionPending1);
    addTransactionPending(transactionPending2);
    addTransactionPending(transactionPending3);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending2,
      transactionPending3,
    ]);
    removeTransactionPending(transactionPending2.eventData.transactionHash);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending3,
    ]);
    removeTransactionPending(transactionPending3.eventData.transactionHash);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
    ]);
    removeTransactionPending(transactionPending1.eventData.transactionHash);
    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
  });

  it('should correctly setBlockNumberWithLatestTx', () => {
    const { setBlockNumberWithLatestTx } = useTransactionLocalStore.getState();

    expect(useTransactionLocalStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    setBlockNumberWithLatestTx(1000);
    expect(useTransactionLocalStore.getState().data.blockNumberWithLatestTx).toEqual(1000);
    setBlockNumberWithLatestTx(1001);
    expect(useTransactionLocalStore.getState().data.blockNumberWithLatestTx).toEqual(1001);
  });

  it('should correctly isAppWaitingForTransactionToBeIndexed', () => {
    /**
     * It checks 2 flags:
     * 1. blockNumberWithLatestTx.
     * 2. If any transaction isWaitingForTransactionInitialized && !iFinalized.
     *
     * Transaction lifecycle:
     * 1. isWaitingForTransactionInitialized false & iFinalized false.
     * 2. isWaitingForTransactionInitialized true & iFinalized false.
     * 2. isWaitingForTransactionInitialized true & iFinalized true.
     */
    const {
      addTransactionPending,
      setBlockNumberWithLatestTx,
      setTransactionIsWaitingForTransactionInitialized,
      setTransactionIsFinalized,
      reset,
    } = useTransactionLocalStore.getState();

    // isWaitingForTransactionInitialized false & iFinalized false
    addTransactionPending(transactionPending1);

    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );

    /**
     1. TRUE: blockNumberWithLatestTx.
     2. FALSE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setBlockNumberWithLatestTx(1000);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      true,
    );

    /**
     1. FALSE: blockNumberWithLatestTx.
     2. FALSE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );

    /**
     1. FALSE: blockNumberWithLatestTx.
     2. TRUE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setTransactionIsWaitingForTransactionInitialized(transactionPending1.eventData.transactionHash);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      true,
    );

    /**
     1. FALSE: blockNumberWithLatestTx.
     2. FALSE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    reset();
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );

    /**
     1. FALSE: blockNumberWithLatestTx.
     2. TRUE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setTransactionIsFinalized(transactionPending1.eventData.transactionHash);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );

    /**
     1. FALSE: blockNumberWithLatestTx.
     2. FALSE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );

    /**
     1. TRUE: blockNumberWithLatestTx.
     2. TRUE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setBlockNumberWithLatestTx(1000);
    setTransactionIsWaitingForTransactionInitialized(transactionPending1.eventData.transactionHash);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      true,
    );

    /**
     1. TRUE: blockNumberWithLatestTx.
     2. FALSE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    reset();
    setBlockNumberWithLatestTx(1000);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      true,
    );

    /**
     1. FALSE: blockNumberWithLatestTx.
     2. FALSE: If any transaction isWaitingForTransactionInitialized && !iFinalized.
     */
    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useTransactionLocalStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(
      false,
    );
  });

  it('should correctly setTransactionIsWaitingForTransactionInitialized', () => {
    const { addTransactionPending, setTransactionIsWaitingForTransactionInitialized } =
      useTransactionLocalStore.getState();

    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
    addTransactionPending(transactionPending1);
    addTransactionPending(transactionPending2);
    expect(
      useTransactionLocalStore
        .getState()
        .data.transactionsPending!.some(
          ({ isWaitingForTransactionInitialized }) => isWaitingForTransactionInitialized,
        ),
    ).toBe(false);

    setTransactionIsWaitingForTransactionInitialized(transactionPending1.eventData.transactionHash);
    expect(
      useTransactionLocalStore
        .getState()
        .data.transactionsPending!.find(
          ({ eventData: { transactionHash } }) =>
            transactionHash === transactionPending1.eventData.transactionHash,
        )!.isWaitingForTransactionInitialized,
    ).toBe(true);
  });

  it('should correctly setTransactionIsFinalized', () => {
    const { addTransactionPending, setTransactionIsFinalized } =
      useTransactionLocalStore.getState();

    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
    addTransactionPending(transactionPending1);
    addTransactionPending(transactionPending2);
    expect(
      useTransactionLocalStore
        .getState()
        .data.transactionsPending!.some(({ isFinalized }) => isFinalized),
    ).toBe(false);

    setTransactionIsFinalized(transactionPending1.eventData.transactionHash);
    expect(
      useTransactionLocalStore
        .getState()
        .data.transactionsPending!.find(
          ({ eventData: { transactionHash } }) =>
            transactionHash === transactionPending1.eventData.transactionHash,
        )!.isFinalized,
    ).toBe(true);
  });

  it('should correctly updateTransactionHash', () => {
    const { addTransactionPending, updateTransactionHash } = useTransactionLocalStore.getState();

    expect(useTransactionLocalStore.getState().data.transactionsPending).toEqual(null);
    addTransactionPending(transactionPending1);
    addTransactionPending(transactionPending2);
    updateTransactionHash({
      newHash: '0x999',
      oldHash: transactionPending1.eventData.transactionHash,
    });

    const transaction = useTransactionLocalStore
      .getState()
      .data.transactionsPending!.find(
        ({ eventData: { transactionHash } }) => transactionHash === '0x999',
      )!;
    expect(transaction.eventData.amount).toEqual(BigInt(10));
    expect(transaction.timestamp).toBe('100');
    expect(transaction.type).toBe('lock');
  });
});
