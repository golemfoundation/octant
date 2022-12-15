import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Epochs, Epochs__factory } from '../../typechain-types';

export default function useContractEpochs({
  tokenAddress = env.epochsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Epochs | null {
  return useMemo(() => {
    return Epochs__factory.connect(tokenAddress, signerOrProvider);
  }, [signerOrProvider, tokenAddress]);
}
