import { PayoutsManager__factory, PayoutsManager } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

export default function useContractPayoutsManager({
  tokenAddress = env.contracts.payoutsManagerAddress,
  signerOrProvider,
}: UseContractParams): PayoutsManager | null {
  return useMemo(() => {
    return PayoutsManager__factory.connect(tokenAddress, signerOrProvider || providerGoerli);
  }, [signerOrProvider, tokenAddress]);
}
