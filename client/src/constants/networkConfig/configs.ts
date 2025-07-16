import { sepolia, mainnet, localhost } from 'wagmi/chains';

import { NetworkConfig } from './types';

export const localNetworkConfig: NetworkConfig = {
  chains: [localhost],
  etherscanAddress: '',
  gnosisSafeApi: '',
  id: 1337,
  isTestnet: true,
  name: 'Local',
};

export const sepoliaNetworkConfig: NetworkConfig = {
  chains: [sepolia],
  etherscanAddress: 'https://sepolia.etherscan.io',
  gnosisSafeApi: 'https://safe-transaction-sepolia.safe.global/',
  id: 11155111,
  isTestnet: true,
  name: 'Sepolia',
};

export const mainnetNetworkConfig: NetworkConfig = {
  chains: [mainnet],
  etherscanAddress: 'https://etherscan.io',
  gnosisSafeApi: 'https://safe-transaction-mainnet.safe.global/',
  id: 1,
  isTestnet: false,
  name: 'Mainnet',
};
