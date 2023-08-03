import useMetaStore from './store';

describe('useMetaStore', () => {
  it('initial state should be correct', () => {
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(null);
  });

  it('should correctly set setBlockNumberWithLatestTx', () => {
    const { setBlockNumberWithLatestTx } = useMetaStore.getState();

    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(null);
    setBlockNumberWithLatestTx(1000);
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(1000);
    setBlockNumberWithLatestTx(1001);
    expect(useMetaStore.getState().data.blockNumberWithLatestTx).toEqual(1001);
  });
});
