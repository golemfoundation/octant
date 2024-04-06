import { LedgerConnector } from '@wagmi/connectors/ledger';
import { w3mConnectors } from '@web3modal/ethereum';
import { configureChains, createConfig, ChainProviderFn } from 'wagmi';
import { localhost, mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { CHAINS, PROJECT_ID } from 'constants/walletConnect';
import env from 'env';

const providers: ChainProviderFn<typeof mainnet | typeof sepolia | typeof localhost>[] = [
  alchemyProvider({ apiKey: env.alchemyId }),
  publicProvider(),
];

if (env.jsonRpcEndpoint) {
  providers.unshift(
    jsonRpcProvider({
      rpc: () => ({
        http: env.jsonRpcEndpoint!,
      }),
    }),
  );
}

const { publicClient } = configureChains<typeof mainnet | typeof sepolia | typeof localhost>(
  CHAINS,
  providers,
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ chains: CHAINS, projectId: PROJECT_ID }),
    new LedgerConnector({
      chains: CHAINS,
      options: {
        projectId: PROJECT_ID,
      },
      // unknown typing conflict.
    }) as any,
  ],
  publicClient,
});
