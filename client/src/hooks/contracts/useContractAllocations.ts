import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Allocations, Allocations__factory } from '../../typechain-types';

export default function useContractAllocations({
  tokenAddress = env.allocationsAddress,
  signerOrProvider,
}: UseContractParams): Allocations | null {
  return useMemo(() => {
    return Allocations__factory.connect(tokenAddress, signerOrProvider || providerGoerli);
  }, [signerOrProvider, tokenAddress]);
}
