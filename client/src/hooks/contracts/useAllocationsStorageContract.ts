import { useMemo } from 'react';

import { providerGoerli } from './providers';

import { AllocationsStorage, AllocationsStorage__factory } from '../../typechain-types';

export default function useAllocationsStorageContract(
  tokenAddress: string,
): AllocationsStorage | null {
  return useMemo(() => {
    return AllocationsStorage__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}
