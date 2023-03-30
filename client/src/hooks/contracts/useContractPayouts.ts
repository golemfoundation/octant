import { Payouts, Payouts__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

export default function useContractPayouts({
  tokenAddress = env.contracts.payoutsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Payouts | null {
  return useMemo(() => {
    return Payouts__factory.connect(tokenAddress, signerOrProvider || providerGoerli);
  }, [signerOrProvider, tokenAddress]);
}
