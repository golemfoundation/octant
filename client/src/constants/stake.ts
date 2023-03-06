import env from 'env';

export const ETH_STAKED = env.isTestnet ? `${2 * 32}.0` : `${3000 * 32}.0`;
