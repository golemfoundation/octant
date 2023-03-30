import { Rewards, Rewards__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

export default function useContractRewards({
  tokenAddress = env.contracts.rewardsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Rewards | null {
  return useMemo(() => {
    return signerOrProvider ? Rewards__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
