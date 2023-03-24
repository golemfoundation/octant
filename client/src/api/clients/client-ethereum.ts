import { EthereumClient } from '@web3modal/ethereum';

import { CHAINS } from 'constants/walletConnect';

import { wagmiClient } from './client-wagmi';

export const ethereumClient = new EthereumClient(wagmiClient, CHAINS);
