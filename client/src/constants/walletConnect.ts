import { mainnet } from 'wagmi/chains';

import env from 'env';

import networkConfig from './networkConfig';

// https://github.com/orgs/WalletConnect/discussions/2880#discussioncomment-7237794
export const CHAINS = [...networkConfig.chains, mainnet];
export const PROJECT_ID = env.walletConnectProjectId;
