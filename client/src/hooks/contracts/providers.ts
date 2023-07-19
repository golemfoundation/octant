import { JsonRpcProvider, InfuraProvider } from '@ethersproject/providers';

import networkConfig from 'constants/networkConfig';

export const provider =
  networkConfig.name === 'Local'
    ? new JsonRpcProvider('http://127.0.0.1:8545/')
    : new InfuraProvider(networkConfig.id);
