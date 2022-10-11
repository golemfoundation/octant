import { Signer, ethers } from 'ethers';
import { useMemo } from 'react';
import type { Provider } from '@ethersproject/providers';

import {
  Allocations,
  Allocations__factory,
  Epochs,
  Epochs__factory,
  Proposals,
  Proposals__factory,
} from '../typechain-types';

const providerGoerli = ethers.providers.getDefaultProvider('goerli');

export function useProposalsContract(tokenAddress: string): Proposals | null {
  return useMemo(() => {
    return Proposals__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}

export function useAllocationsContract(
  tokenAddress: string,
  signerOrProvider?: Signer | Provider,
): Allocations | null {
  return useMemo(() => {
    return signerOrProvider ? Allocations__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [tokenAddress, signerOrProvider]);
}

export function useEpochsContract(tokenAddress: string): Epochs | null {
  return useMemo(() => {
    return Epochs__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}
