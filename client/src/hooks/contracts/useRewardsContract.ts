import { useMemo } from 'react';

import { providerGoerli } from './providers';

import { Rewards, Rewards__factory } from '../../typechain-types';

export default function useRewardsContract(tokenAddress: string): Rewards | null {
  return useMemo(() => {
    return Rewards__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}
