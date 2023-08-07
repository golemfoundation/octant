import { w3mConnectors } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

import { CHAINS, PROJECT_ID } from 'constants/walletConnect';
import env from 'env';

const { publicClient } = configureChains<typeof mainnet | typeof sepolia>(CHAINS, [
  alchemyProvider({ apiKey: env.alchemyId }),
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ chains: CHAINS, projectId: PROJECT_ID }),
  publicClient,
});
