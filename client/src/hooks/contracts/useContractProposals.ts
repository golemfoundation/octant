import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Proposals, Proposals__factory } from '../../typechain-types';

export default function useContractProposals({
  tokenAddress = env.contracts.proposalsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Proposals | null {
  return useMemo(() => {
    return signerOrProvider ? Proposals__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
