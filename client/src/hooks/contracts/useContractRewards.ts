import { useMemo } from 'react';

import { IS_TEST_REWARDS_ENABLED } from 'constants/localStorageKeys';
import env from 'env';

import { providerGoerli } from './providers';
import UseContractParams from './types';

import { Rewards, Rewards__factory } from '../../typechain-types';

const isTestRewardsEnabled = localStorage.getItem(IS_TEST_REWARDS_ENABLED) === 'true';

export default function useContractRewards({
  tokenAddress = isTestRewardsEnabled
    ? env.contracts.testRewardsAddress
    : env.contracts.rewardsAddress,
  signerOrProvider = providerGoerli,
}: UseContractParams = {}): Rewards | null {
  return useMemo(() => {
    return Rewards__factory.connect(tokenAddress, signerOrProvider);
  }, [signerOrProvider, tokenAddress]);
}
