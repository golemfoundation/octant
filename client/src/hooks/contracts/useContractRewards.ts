import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Rewards, Rewards__factory } from '../../typechain-types';

export default function useContractRewards({
  tokenAddress = env.rewardsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Rewards | null {
  return useMemo(() => {
    return Rewards__factory.connect(tokenAddress, signerOrProvider);
  }, [signerOrProvider, tokenAddress]);
}
