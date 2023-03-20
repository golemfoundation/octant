export interface WalletState {
  address?: string;
  isConnected: boolean;
  web3?: any;
}

export interface WalletStore {
  connect: (
    connect: (Web3Interface: any, settings?: {}) => Promise<void>,
    getAccounts: ({ requestPermission }: { requestPermission: boolean }) => Promise<any>,
  ) => Promise<void>;
  disconnect: () => void;
  wallet: WalletState;
}
