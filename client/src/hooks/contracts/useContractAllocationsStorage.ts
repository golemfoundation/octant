import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { AllocationsStorage, AllocationsStorage__factory } from '../../typechain-types';

export default function useContractAllocationsStorage({
  tokenAddress = env.contracts.allocationsStorageAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): AllocationsStorage | null {
  return useMemo(() => {
    return AllocationsStorage__factory.connect(tokenAddress, signerOrProvider);
  }, [signerOrProvider, tokenAddress]);
}
