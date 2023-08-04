import { sepolia, mainnet } from 'wagmi/chains';

import { NetworkConfig } from './types';

// TODO Following OCT-316 proper local config needs to be defined.
export const localNetworkConfig: NetworkConfig = {
  alchemyUrl: '',
  chains: [],
  etherscanAddress: '',
  id: -1,
  isTestnet: true,
  name: 'Local',
};

export const sepoliaNetworkConfig: NetworkConfig = {
  alchemyUrl: 'https://eth-sepolia.g.alchemy.com/v2',
  chains: [sepolia],
  etherscanAddress: 'https://sepolia.etherscan.io',
  id: 11155111,
  isTestnet: true,
  name: 'Sepolia',
};

export const mainnetNetworkConfig: NetworkConfig = {
  alchemyUrl: 'https://eth-mainnet.g.alchemy.com/v2',
  chains: [mainnet],
  etherscanAddress: 'https://etherscan.io',
  id: 1,
  isTestnet: false,
  name: 'Mainnet',
};
