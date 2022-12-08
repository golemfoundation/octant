import { useMemo } from 'react';

import { providerGoerli } from './providers';

import { Epochs, Epochs__factory } from '../../typechain-types';

export default function useEpochsContract(tokenAddress: string): Epochs | null {
  return useMemo(() => {
    return Epochs__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}
