import { EthereumClient } from '@web3modal/ethereum';

import { CHAINS } from 'constants/walletConnect';

import { wagmiConfig } from './client-wagmi';

export const ethereumClient = new EthereumClient(wagmiConfig, CHAINS);
