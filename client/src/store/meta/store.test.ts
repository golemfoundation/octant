import { BigNumber } from 'ethers';

import { transactionPending1, transactionPending2, transactionPending3 } from 'mocks/history';

import useMetaStore, { initialState } from './store';

describe('useMetaStore', () => {
  afterEach(() => {
    const { reset } = useMetaStore.getState();
    localStorage.clear();
    reset();
  });

  it('initial state should be correct', () => {
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);
  });

  it('should correctly addTransactionPending', () => {
    const { addTransactionPending } = useMetaStore.getState();

    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
    addTransactionPending(transactionPending1);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([transactionPending1]);
    addTransactionPending(transactionPending2);
    addTransactionPending(transactionPending3);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending2,
      transactionPending3,
    ]);
  });

  it('should correctly removeTransactionPending', () => {
    const { removeTransactionPending, setTransactionsPending } = useMetaStore.getState();

    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
    setTransactionsPending([transactionPending1, transactionPending2, transactionPending3]);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending2,
      transactionPending3,
    ]);
    removeTransactionPending(transactionPending2.hash);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending3,
    ]);
    removeTransactionPending(transactionPending3.hash);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([transactionPending1]);
    removeTransactionPending(transactionPending1.hash);
    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
  });

  it('should correctly setBlockNumberWithLatestTx', () => {
    const { setBlockNumberWithLatestTx } = useMetaStore.getState();

    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    setBlockNumberWithLatestTx(1000);
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(1000);
    setBlockNumberWithLatestTx(1001);
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(1001);
  });

  it('should correctly isAppWaitingForTransactionToBeIndexed', () => {
    const { setTransactionsPending, setBlockNumberWithLatestTx } = useMetaStore.getState();

    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);

    setBlockNumberWithLatestTx(1000);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);

    setTransactionsPending([transactionPending1]);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setTransactionsPending(initialState.transactionsPending);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);

    setBlockNumberWithLatestTx(1000);
    setTransactionsPending([transactionPending2]);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setTransactionsPending(initialState.transactionsPending);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);
  });

  it('should correctly setTransactionIsFetching', () => {
    const { setTransactionsPending, setTransactionIsFetching } = useMetaStore.getState();

    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
    setTransactionsPending([transactionPending1, transactionPending2]);
    expect(
      useMetaStore.getState().data.transactionsPending!.some(({ isFetching }) => isFetching),
    ).toBe(false);

    setTransactionIsFetching(transactionPending1.hash);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending2,
    ]);
    expect(
      useMetaStore
        .getState()
        .data.transactionsPending!.find(({ hash }) => hash === transactionPending1.hash)!
        .isFetching,
    ).toBe(true);
  });

  it('should correctly setTransactionsPending', () => {
    const { setTransactionsPending } = useMetaStore.getState();

    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
    setTransactionsPending([transactionPending1, transactionPending2]);
    expect(useMetaStore.getState().data.transactionsPending).toEqual([
      transactionPending1,
      transactionPending2,
    ]);
  });

  it('should correctly updateTransactionHash', () => {
    const { setTransactionsPending, updateTransactionHash } = useMetaStore.getState();

    expect(useMetaStore.getState().data.transactionsPending).toEqual(null);
    setTransactionsPending([transactionPending1, transactionPending2]);
    updateTransactionHash({ newHash: '0x999', oldHash: transactionPending1.hash });

    const transaction = useMetaStore
      .getState()
      .data.transactionsPending!.find(({ hash }) => hash === '0x999')!;
    expect(transaction.amount).toEqual(BigNumber.from(10));
    expect(transaction.timestamp).toBe('100');
    expect(transaction.type).toBe('lock');
  });
});
