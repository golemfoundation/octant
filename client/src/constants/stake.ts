import { parseUnits } from 'ethers/lib/utils';

import env from 'env';

export const ETH_STAKED = parseUnits((env.isTestnet ? 2 * 32 : 3000 * 32).toString());
