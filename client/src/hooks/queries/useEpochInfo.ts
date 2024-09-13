import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochInfo, Response } from 'api/calls/epochInfo';
import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type EpochInfo = {
  communityFund: bigint;
  donatedToProjects: bigint;
  leftover: bigint;
  matchedRewards: bigint;
  operationalCost: bigint;
  patronsRewards: bigint;
  ppf: bigint;
  staking: bigint;
  stakingProceeds: bigint;
  totalEffectiveDeposit: bigint;
  totalRewards: bigint;
  totalWithdrawals: bigint;
  vanillaIndividualRewards: bigint;
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
    queryFn: ({ signal }) => apiGetEpochInfo(epoch, signal),
    queryKey: QUERY_KEYS.epochInfo(epoch),
    select: response => ({
      communityFund: response.communityFund
        ? parseUnitsBigInt(response.communityFund, 'wei')
        : BigInt(0),
      donatedToProjects: response.donatedToProjects
        ? parseUnitsBigInt(response.donatedToProjects, 'wei')
        : BigInt(0),
      matchedRewards: response.matchedRewards
        ? parseUnitsBigInt(response.matchedRewards, 'wei')
        : BigInt(0),
      operationalCost: response.operationalCost
        ? parseUnitsBigInt(response.operationalCost, 'wei')
        : BigInt(0),
      patronsRewards: response.patronsRewards
        ? parseUnitsBigInt(response.patronsRewards, 'wei')
        : BigInt(0),
      ppf: response.ppf ? parseUnitsBigInt(response.ppf, 'wei') : BigInt(0),
      stakingProceeds: parseUnitsBigInt(response.stakingProceeds, 'wei'),
      totalEffectiveDeposit: parseUnitsBigInt(response.totalEffectiveDeposit, 'wei'),
      totalRewards: parseUnitsBigInt(response.totalRewards, 'wei'),
      totalWithdrawals: response.totalWithdrawals
        ? parseUnitsBigInt(response.totalWithdrawals, 'wei')
        : BigInt(0),
      vanillaIndividualRewards: parseUnitsBigInt(response.vanillaIndividualRewards, 'wei'),
      ...getLeftoverAndStaking(epoch, response.leftover),
    }),
    ...options,
  });
}
