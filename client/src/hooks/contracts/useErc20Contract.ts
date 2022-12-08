import { Signer } from 'ethers';
import { useMemo } from 'react';

import { ERC20, ERC20__factory } from '../../typechain-types';

export default function useErc20Contract(tokenAddress: string, signer?: Signer): ERC20 | null {
  return useMemo(() => {
    return signer ? ERC20__factory.connect(tokenAddress, signer) : null;
  }, [tokenAddress, signer]);
}
