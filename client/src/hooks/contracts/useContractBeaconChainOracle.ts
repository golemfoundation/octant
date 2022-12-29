import { useMemo } from 'react';

import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { BeaconChainOracle, BeaconChainOracle__factory } from '../../typechain-types';

export default function useContractBeaconChainOracle({
  tokenAddress = env.contracts.beaconChainOracle,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): BeaconChainOracle | null {
  return useMemo(() => {
    return signerOrProvider
      ? BeaconChainOracle__factory.connect(tokenAddress, signerOrProvider)
      : null;
  }, [signerOrProvider, tokenAddress]);
}
