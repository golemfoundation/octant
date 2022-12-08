import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { useMemo } from 'react';

import { providerGoerli } from './providers';

import { Allocations, Allocations__factory } from '../../typechain-types';

export default function useAllocationsContract(
  tokenAddress: string,
  signerOrProvider?: Signer | Provider,
): Allocations | null {
  return useMemo(() => {
    return Allocations__factory.connect(tokenAddress, signerOrProvider || providerGoerli);
  }, [tokenAddress, signerOrProvider]);
}
