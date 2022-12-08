import { useMemo } from 'react';

import { providerGoerli } from './providers';

import { Proposals, Proposals__factory } from '../../typechain-types';

export default function useProposalsContract(tokenAddress: string): Proposals | null {
  return useMemo(() => {
    return Proposals__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}
