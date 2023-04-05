import { Epochs, Epochs__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { provider } from './providers';
import UseContractParams from './types';

export default function useContractEpochs({
  tokenAddress = env.contracts.epochsAddress,
  signerOrProvider = provider,
}: UseContractParams = {}): Epochs | null {
  return useMemo(() => {
    return signerOrProvider ? Epochs__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
