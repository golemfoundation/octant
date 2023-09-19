import { sepolia, mainnet, localhost } from 'wagmi/chains';

import { Env } from 'types/env';

export type NetworkConfig = {
  chains: [typeof sepolia] | [typeof mainnet] | [typeof localhost] | [];
  etherscanAddress: string;
  id: number;
  isTestnet: boolean;
  name: Env['network'];
};
