import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Tracker, Tracker__factory } from '../../typechain-types';

export default function useContractTracker({
  tokenAddress = env.contracts.trackerAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Tracker | null {
  return useMemo(() => {
    return Tracker__factory.connect(tokenAddress, signerOrProvider);
  }, [signerOrProvider, tokenAddress]);
}
