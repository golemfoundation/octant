import { Proposals, Proposals__factory } from 'submodule-contracts';
import { Signer } from 'ethers';
import { useMemo } from 'react';

export function useProposalsContract(tokenAddress: string, signer?: Signer): Proposals | null {
  return useMemo(() => {
    return signer ? Proposals__factory.connect(tokenAddress, signer) : null;
  }, [tokenAddress, signer]);
}
