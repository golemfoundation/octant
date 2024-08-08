import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { injectedWallet, walletConnectWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets';
import { HttpTransport } from 'viem';
import { createConfig, http } from 'wagmi';
import { localhost, mainnet, sepolia } from 'wagmi/chains';

import { CHAINS, PROJECT_ID } from 'constants/walletConnect';
import env from 'env';

/* eslint-disable @typescript-eslint/naming-convention */
type Transports = {
  1: HttpTransport;
  11155111: HttpTransport;
};
type TransportsWithLocalhost = Transports & {
  1337: HttpTransport;
};
/* eslint-enable @typescript-eslint/naming-convention */

let transports: Transports = {
  [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${env.alchemyId}`),
  [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${env.alchemyId}`),
};

if (env.jsonRpcEndpoint) {
  transports = {
    ...transports,
    [localhost.id]: http(env.jsonRpcEndpoint!),
  } as TransportsWithLocalhost;
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet, walletConnectWallet, ledgerWallet],
    },
  ],
  { appName: 'Octant App', projectId: PROJECT_ID },
);

export const wagmiConfig = createConfig({
  chains: CHAINS,
  connectors,
  transports,
});
