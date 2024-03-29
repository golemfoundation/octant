import env from 'env';
import { Env } from 'types/env';

import { localNetworkConfig, sepoliaNetworkConfig, mainnetNetworkConfig } from './configs';
import { NetworkConfig } from './types';

export const getNetworkConfig = (envConfig: Env): NetworkConfig => {
  switch (envConfig.network) {
    case 'Local':
      return localNetworkConfig;
    case 'Mainnet':
      return mainnetNetworkConfig;
    case 'Sepolia':
    default:
      return sepoliaNetworkConfig;
  }
};

const networkConfig = getNetworkConfig(env);

export default networkConfig;
