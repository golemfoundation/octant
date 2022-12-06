import { InfuraProvider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { useMemo } from 'react';
import type { Provider } from '@ethersproject/providers';

import {
  Allocations,
  Allocations__factory,
  Deposits,
  Deposits__factory,
  ERC20,
  ERC20__factory,
  Epochs,
  Epochs__factory,
  Proposals,
  Proposals__factory,
} from '../typechain-types';

const providerGoerli = new InfuraProvider('goerli');

export function useErc20Contract(tokenAddress: string, signer?: Signer): ERC20 | null {
  return useMemo(() => {
    return signer ? ERC20__factory.connect(tokenAddress, signer) : null;
  }, [tokenAddress, signer]);
}

export function useProposalsContract(tokenAddress: string): Proposals | null {
  return useMemo(() => {
    return Proposals__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}

// TODO: Use Goerli.
export function useAllocationsContract(
  tokenAddress: string,
  signerOrProvider?: Signer | Provider,
): Allocations | null {
  return useMemo(() => {
    return signerOrProvider ? Allocations__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [tokenAddress, signerOrProvider]);
}

export function useDepositsContract(
  tokenAddress: string,
  signerOrProvider?: Signer | Provider,
): Deposits | null {
  return useMemo(() => {
    return signerOrProvider ? Deposits__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [tokenAddress, signerOrProvider]);
}

export function useEpochsContract(tokenAddress: string): Epochs | null {
  return useMemo(() => {
    return Epochs__factory.connect(tokenAddress, providerGoerli);
  }, [tokenAddress]);
}
