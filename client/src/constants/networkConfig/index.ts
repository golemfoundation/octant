import { goerli, sepolia } from 'wagmi/chains';

import env from 'env';
import { Env } from 'types/env';

export type NetworkConfig = {
  chains: [typeof goerli] | [typeof sepolia] | [];
  etherscanAddress: string;
  id: number;
  name: 'Goerli' | 'Local' | 'Sepolia';
};

export const getNetworkConfig = (envConfig: Env): NetworkConfig => {
  // TODO Following OCT-316 proper local config needs to be defined.
  if (envConfig.isUsingLocalContracts === 'true') {
    return {
      chains: [],
      etherscanAddress: '',
      id: -1,
      name: 'Local',
    };
  }
  return envConfig.network === 'Goerli'
    ? {
        chains: [goerli],
        etherscanAddress: 'https://goerli.etherscan.io',
        id: 5,
        name: 'Goerli',
      }
    : {
        chains: [sepolia],
        etherscanAddress: 'https://sepolia.etherscan.io',
        id: 11155111,
        name: 'Sepolia',
      };
};

const networkConfig = getNetworkConfig(env);

export default networkConfig;
