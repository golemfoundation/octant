import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetEpochInfo, Response } from 'api/calls/epochInfo';
import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';

type EpochInfo = {
  individualRewards: BigNumber;
  leftover: BigNumber;
  matchedRewards: BigNumber;
  operationalCost: BigNumber;
  patronsRewards: BigNumber;
  staking: BigNumber;
  stakingProceeds: BigNumber;
  totalEffectiveDeposit: BigNumber;
  totalRewards: BigNumber;
  totalWithdrawals: BigNumber;
};

// TODO OCT-1364 Remove this util, adjust backend response
const getLeftoverAndStaking = (
  epoch: number,
  leftover: string | null,
): {
  leftover: BigNumber;
  staking: BigNumber;
} => {
  const isMainnetAndEpoch2 = env.network === 'Mainnet' && epoch === 2;
  const leftoverBigNumber = leftover ? parseUnits(leftover, 'wei') : BigNumber.from(0);
  const stakingBigNumber = isMainnetAndEpoch2 ? parseUnits('352') : BigNumber.from(0);

  return {
    leftover: leftoverBigNumber.sub(stakingBigNumber),
    staking: stakingBigNumber,
  };
};

export default function useEpochInfo(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochInfo, any>,
): UseQueryResult<EpochInfo, unknown> {
  return useQuery({
    queryFn: () => apiGetEpochInfo(epoch),
    queryKey: QUERY_KEYS.epochInfo(epoch),
    select: response => ({
      individualRewards: parseUnits(response.individualRewards, 'wei'),
      matchedRewards: response.matchedRewards
        ? parseUnits(response.matchedRewards, 'wei')
        : BigNumber.from(0),
      operationalCost: response.operationalCost
        ? parseUnits(response.operationalCost, 'wei')
        : BigNumber.from(0),
      patronsRewards: response.patronsRewards
        ? parseUnits(response.patronsRewards, 'wei')
        : BigNumber.from(0),
      stakingProceeds: parseUnits(response.stakingProceeds, 'wei'),
      totalEffectiveDeposit: parseUnits(response.totalEffectiveDeposit, 'wei'),
      totalRewards: parseUnits(response.totalRewards, 'wei'),
      totalWithdrawals: response.totalWithdrawals
        ? parseUnits(response.totalWithdrawals, 'wei')
        : BigNumber.from(0),
      ...getLeftoverAndStaking(epoch, response.leftover),
    }),
    ...options,
  });
}
