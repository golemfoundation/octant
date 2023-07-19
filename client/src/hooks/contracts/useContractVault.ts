import { Vault, Vault__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { provider } from './providers';
import UseContractParams from './types';

export default function useContractVault({
  tokenAddress = env.contractVaultAddress,
  signerOrProvider = provider,
}: UseContractParams = {}): Vault | null {
  return useMemo(() => {
    return signerOrProvider ? Vault__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
