import { Chain, mainnet } from 'wagmi/chains';

import env from 'env';

import networkConfig from './networkConfig';

/**
 * Adding mainnet here is workaround for a known issue: https://github.com/wevm/wagmi/issues/3012.
 * TODO OCT-1301 check if this workaround is still required after update of wagmi to v2.
 */
// @ts-expect-error Check this typing issue, mainnet fallsback to undefined?
export const CHAINS: [Chain, Chain] = [...networkConfig.chains, mainnet];
export const PROJECT_ID = env.walletConnectProjectId;
