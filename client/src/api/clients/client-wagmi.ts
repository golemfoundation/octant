import { w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createClient } from 'wagmi';

import { CHAINS, PROJECT_ID } from 'constants/walletConnect';

const { provider } = configureChains(CHAINS, [w3mProvider({ projectId: PROJECT_ID })]);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ chains: CHAINS, projectId: PROJECT_ID, version: 1 }),
  provider,
});
