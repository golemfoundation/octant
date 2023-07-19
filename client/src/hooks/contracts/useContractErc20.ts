import { ERC20, ERC20__factory } from 'octant-typechain-types';
import { useMemo } from 'react';

import env from 'env';

import UseContractParams from './types';

export default function useContractErc20({
  signerOrProvider,
  tokenAddress = env.contractGlmAddress,
}: UseContractParams): ERC20 | null {
  return useMemo(() => {
    return signerOrProvider ? ERC20__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [signerOrProvider, tokenAddress]);
}
