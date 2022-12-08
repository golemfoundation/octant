import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { useMemo } from 'react';

import { Deposits, Deposits__factory } from '../../typechain-types';

export default function useDepositsContract(
  tokenAddress: string,
  signerOrProvider?: Signer | Provider,
): Deposits | null {
  return useMemo(() => {
    return signerOrProvider ? Deposits__factory.connect(tokenAddress, signerOrProvider) : null;
  }, [tokenAddress, signerOrProvider]);
}
