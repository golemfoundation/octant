import { ethers } from 'ethers';
import { create } from 'zustand';

import { WalletState, WalletStore } from './types';

const defaultState: WalletState = {
  address: undefined,
  isConnected: false,
};

// TODO OCT-338 Probably remove this store.
const useWallet = create<WalletStore>(set => ({
  connect: async (connect, getAccounts) => {
    await connect(ethers.providers.Web3Provider, 'any');
    const account = await getAccounts!({ requestPermission: true });

    // @ts-expect-error window.ethereum is not defined.
    const web3 = new ethers.providers.Web3Provider(window.ethereum);

    set({
      wallet: {
        address: account[0],
        isConnected: true,
        web3,
      },
    });
  },
  disconnect: () => set({ wallet: defaultState }),
  wallet: defaultState,
}));

export default useWallet;
