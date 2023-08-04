import { sepolia, mainnet } from 'wagmi/chains';

import { Env } from 'types/env';

export type NetworkConfig = {
  alchemyUrl: string;
  chains: [typeof sepolia] | [typeof mainnet] | [];
  etherscanAddress: string;
  id: number;
  isTestnet: boolean;
  name: Env['network'];
};
