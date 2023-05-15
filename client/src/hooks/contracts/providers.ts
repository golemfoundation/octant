import { JsonRpcProvider, InfuraProvider } from '@ethersproject/providers';

import networkConfig from 'constants/networkConfig';
import env from 'env';

export const provider =
  env.isUsingLocalContracts === 'true'
    ? new JsonRpcProvider('http://127.0.0.1:8545/')
    : new InfuraProvider(networkConfig.id);
