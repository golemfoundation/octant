import env from 'env';

import networkConfig from './networkConfig';

export const CHAINS = networkConfig.chains;
export const PROJECT_ID = env.walletConnectProjectId;
