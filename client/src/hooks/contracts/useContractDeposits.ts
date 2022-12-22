import { useMemo } from 'react';

import env from 'env';

import UseContractParams from './types';

import { Deposits, Deposits__factory } from '../../typechain-types';

export default function useContractDeposits({
  tokenAddress = env.contracts.depositsAddress,
  signerOrProvider,
}: UseContractParams): Deposits | null {
  return useMemo(() => {
    return signerOrProvider ? Deposits__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
