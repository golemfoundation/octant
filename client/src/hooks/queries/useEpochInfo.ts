import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochInfo, Response } from 'api/calls/epochInfo';
import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type EpochInfo = {
  individualRewards: bigint;
  leftover: bigint;
  matchedRewards: bigint;
  operationalCost: bigint;
  patronsRewards: bigint;
  staking: bigint;
  stakingProceeds: bigint;
  totalEffectiveDeposit: bigint;
  totalRewards: bigint;
  totalWithdrawals: bigint;
};

// TODO OCT-1364 Remove this util, adjust backend response
const getLeftoverAndStaking = (
  epoch: number,
  leftover: string | null,
): {
  leftover: bigint;
  staking: bigint;
} => {
  const isMainnetAndEpoch2 = env.network === 'Mainnet' && epoch === 2;
  const leftoverBigInt = leftover ? parseUnitsBigInt(leftover, 'wei') : BigInt(0);
  const stakingBigInt = isMainnetAndEpoch2 ? parseUnitsBigInt('352') : BigInt(0);

  return {
    leftover: leftoverBigInt - stakingBigInt,
    staking: stakingBigInt,
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
      individualRewards: parseUnitsBigInt(response.individualRewards, 'wei'),
      matchedRewards: response.matchedRewards
        ? parseUnitsBigInt(response.matchedRewards, 'wei')
        : BigInt(0),
      operationalCost: response.operationalCost
        ? parseUnitsBigInt(response.operationalCost, 'wei')
        : BigInt(0),
      patronsRewards: response.patronsRewards
        ? parseUnitsBigInt(response.patronsRewards, 'wei')
        : BigInt(0),
      stakingProceeds: parseUnitsBigInt(response.stakingProceeds, 'wei'),
      totalEffectiveDeposit: parseUnitsBigInt(response.totalEffectiveDeposit, 'wei'),
      totalRewards: parseUnitsBigInt(response.totalRewards, 'wei'),
      totalWithdrawals: response.totalWithdrawals
        ? parseUnitsBigInt(response.totalWithdrawals, 'wei')
        : BigInt(0),
      ...getLeftoverAndStaking(epoch, response.leftover),
    }),
    ...options,
  });
}
