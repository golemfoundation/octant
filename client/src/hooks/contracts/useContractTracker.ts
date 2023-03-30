import { Tracker, Tracker__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

export default function useContractTracker({
  tokenAddress = env.contracts.trackerAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Tracker | null {
  return useMemo(() => {
    return signerOrProvider ? Tracker__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
