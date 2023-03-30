import { AllocationsStorage, AllocationsStorage__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

export default function useContractAllocationsStorage({
  tokenAddress = env.contracts.allocationsStorageAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): AllocationsStorage | null {
  return useMemo(() => {
    return signerOrProvider
      ? AllocationsStorage__factory.connect(tokenAddress, signerOrProvider)
      : null;
  }, [signerOrProvider, tokenAddress]);
}
