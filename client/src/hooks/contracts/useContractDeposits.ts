import { Deposits, Deposits__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import UseContractParams from './types';

export default function useContractDeposits({
  tokenAddress = env.contracts.depositsAddress,
  signerOrProvider,
}: UseContractParams): Deposits | null {
  return useMemo(() => {
    return signerOrProvider ? Deposits__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
