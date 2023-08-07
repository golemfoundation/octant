import useMetaStore, { initialState } from './store';

describe('useMetaStore', () => {
  afterEach(() => {
    const { reset } = useMetaStore.getState();
    localStorage.clear();
    reset();
  });

  it('initial state should be correct', () => {
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    expect(useMetaStore.getState().data.transactionHashesToWaitFor).toEqual(null);
  });

  it('should correctly set setBlockNumberWithLatestTx', () => {
    const { setBlockNumberWithLatestTx } = useMetaStore.getState();

    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    setBlockNumberWithLatestTx(1000);
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(1000);
    setBlockNumberWithLatestTx(1001);
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(1001);
  });

  it('should correctly set setTransactionHashesToWaitFor', () => {
    const { setTransactionHashesToWaitFor } = useMetaStore.getState();

    expect(useMetaStore.getState().data.transactionHashesToWaitFor).toEqual(null);
    setTransactionHashesToWaitFor(['0x12345']);
    expect(useMetaStore.getState().data.transactionHashesToWaitFor).toEqual(['0x12345']);
    setTransactionHashesToWaitFor(['0x123456']);
    expect(useMetaStore.getState().data.transactionHashesToWaitFor).toEqual(['0x123456']);
  });

  it('should correctly set isAppWaitingForTransactionToBeIndexed', () => {
    const { setTransactionHashesToWaitFor, setBlockNumberWithLatestTx } = useMetaStore.getState();

    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);

    setBlockNumberWithLatestTx(1000);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);

    setTransactionHashesToWaitFor(['0x123456']);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setTransactionHashesToWaitFor(initialState.transactionHashesToWaitFor);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);

    setBlockNumberWithLatestTx(1000);
    setTransactionHashesToWaitFor(['0x123456']);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setTransactionHashesToWaitFor(initialState.transactionHashesToWaitFor);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(true);

    setBlockNumberWithLatestTx(initialState.blockNumberWithLatestTx);
    expect(useMetaStore.getState().data.isAppWaitingForTransactionToBeIndexed).toEqual(false);
  });
});
