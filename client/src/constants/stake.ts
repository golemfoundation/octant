import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import networkConfig from './networkConfig';

export const ETH_STAKED = parseUnitsBigInt((32 * (networkConfig.isTestnet ? 2 : 3125)).toString());
