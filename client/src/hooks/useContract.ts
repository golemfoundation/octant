import { ethers } from 'ethers';
import { useMemo } from 'react';

import { Proposals, Proposals__factory } from '../typechain-types';

export function useProposalsContract(tokenAddress: string): Proposals | null {
  return useMemo(() => {
    return Proposals__factory.connect(tokenAddress, ethers.providers.getDefaultProvider('goerli'));
  }, [tokenAddress]);
}
