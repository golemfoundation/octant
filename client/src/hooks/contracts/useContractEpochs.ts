import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Epochs, Epochs__factory } from '../../typechain-types';

export default function useContractEpochs({
  tokenAddress = env.contracts.epochsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Epochs | null {
  return useMemo(() => {
    return signerOrProvider ? Epochs__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
