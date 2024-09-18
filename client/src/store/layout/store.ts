import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { LayoutData, LayoutMethods } from './types';

export const initialState: LayoutData = {
  isAllocationDrawerOpen: false,
  isConnectWalletModalOpen: false,
  isSettingsDrawerOpen: false,
  isWalletModalOpen: false,
};

export default getStoreWithMeta<LayoutData, LayoutMethods>({
  getStoreMethods: set => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsAllocationDrawerOpen: payload => {
      set(state => {
        return { data: { ...state.data, isAllocationDrawerOpen: payload } };
      });
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsConnectWalletModalOpen: payload => {
      set(state => {
        return { data: { ...state.data, isConnectWalletModalOpen: payload } };
      });
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsSettingsDrawerOpen: payload => {
      set(state => {
        return { data: { ...state.data, isSettingsDrawerOpen: payload } };
      });
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setIsWalletModalOpen: payload => {
      set(state => {
        return { data: { ...state.data, isWalletModalOpen: payload } };
      });
    },
  }),
  initialState,
});
