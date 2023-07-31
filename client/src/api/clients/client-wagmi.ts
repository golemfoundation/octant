import { w3mConnectors } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';
import { goerli, mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { CHAINS, PROJECT_ID } from 'constants/walletConnect';
import env from 'env';

const { publicClient } = configureChains<typeof goerli | typeof mainnet | typeof sepolia>(CHAINS, [
  alchemyProvider({ apiKey: env.alchemyId }),
  publicProvider(),
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ chains: CHAINS, projectId: PROJECT_ID }),
  publicClient,
});
