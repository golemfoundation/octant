import { parseUnits } from 'ethers/lib/utils';

import networkConfig from './networkConfig';

export const ETH_STAKED = parseUnits((networkConfig.isTestnet ? 2 * 32 : 3000 * 32).toString());
