import { BigNumber } from 'ethers';
import { UseQueryResult } from 'react-query';

import useCurrentEpoch from './useCurrentEpoch';
import useDepositEffectiveAtGivenEpoch from './useDepositEffectiveAtGivenEpoch';

export default function useDepositEffectiveAtCurrentEpoch(): UseQueryResult<BigNumber | undefined> {
  const { data: currentEpoch } = useCurrentEpoch();

  return useDepositEffectiveAtGivenEpoch(currentEpoch);
}
