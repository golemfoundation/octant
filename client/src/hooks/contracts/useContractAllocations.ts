import { Allocations, Allocations__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { provider } from './providers';
import UseContractParams from './types';

export default function useContractAllocations({
  tokenAddress = env.contracts.allocationsAddress,
  signerOrProvider,
}: UseContractParams): Allocations | null {
  return useMemo(() => {
    return Allocations__factory.connect(tokenAddress, signerOrProvider || provider);
  }, [signerOrProvider, tokenAddress]);
}
