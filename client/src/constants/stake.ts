import { parseUnits } from 'ethers/lib/utils';

import networkConfig from './networkConfig';

export const ETH_STAKED = parseUnits((networkConfig.isTestnet ? 32 * 2 : 32 * 2060).toString());
