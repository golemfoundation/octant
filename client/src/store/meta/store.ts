import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { MetaData, MetaMethods } from './types';

export const initialState: MetaData = {
  blockNumberWithLatestTx: null,
};

export default getStoreWithMeta<MetaData, MetaMethods>({
  getStoreMethods: set => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setBlockNumberWithLatestTx: payload => {
      set(state => ({
        data: { ...state.data, blockNumberWithLatestTx: payload },
      }));
    },
  }),
  initialState,
});
