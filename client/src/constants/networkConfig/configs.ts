import { sepolia, mainnet } from 'wagmi/chains';

import { NetworkConfig } from './types';

// TODO Following OCT-316 proper local config needs to be defined.
export const localNetworkConfig: NetworkConfig = {
  chains: [],
  etherscanAddress: '',
  id: -1,
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
