import { sepolia, mainnet, localhost } from 'wagmi/chains';

import { NetworkConfig } from './types';

export const localNetworkConfig: NetworkConfig = {
  chains: [localhost],
  etherscanAddress: '',
  id: 1337,
  isTestnet: true,
  name: 'Local',
};

export const sepoliaNetworkConfig: NetworkConfig = {
  chains: [sepolia],
  etherscanAddress: 'https://sepolia.etherscan.io',
  id: 11155111,
  isTestnet: true,
  name: 'Sepolia',
};

export const mainnetNetworkConfig: NetworkConfig = {
  chains: [mainnet],
  etherscanAddress: 'https://etherscan.io',
  id: 1,
  isTestnet: false,
  name: 'Mainnet',
};
