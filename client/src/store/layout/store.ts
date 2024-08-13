import { getStoreWithMeta } from 'store/utils/getStoreWithMeta';

import { LayoutData, LayoutMethods } from './types';

export const initialState: LayoutData = {
  showAllocateDrawer: false,
  showConnectWalletModal: false,
  showSettingsDrawer: false,
  showWalletModal: false,
};

export default getStoreWithMeta<LayoutData, LayoutMethods>({
  getStoreMethods: set => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setShowAllocateDrawer: payload => {
      set(state => {
        return { data: { ...state.data, showAllocateDrawer: payload } };
      });
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setShowConnectWalletModal: payload => {
      set(state => {
        return { data: { ...state.data, showConnectWalletModal: payload } };
      });
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setShowSettingsDrawer: payload => {
      set(state => {
        return { data: { ...state.data, showSettingsDrawer: payload } };
      });
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setShowWalletModal: payload => {
      set(state => {
        return { data: { ...state.data, showWalletModal: payload } };
      });
    },
  }),
  initialState,
});
