import { parseUnits } from 'ethers/lib/utils';

import networkConfig from './networkConfig';

export const ETH_STAKED = parseUnits((32 * (networkConfig.isTestnet ? 2 : 3125)).toString());
