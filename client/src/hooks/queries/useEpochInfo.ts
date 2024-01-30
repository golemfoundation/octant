import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetEpochInfo, Response } from 'api/calls/epochInfo';
import { QUERY_KEYS } from 'api/queryKeys';

type EpochInfo = {
  individualRewards: BigNumber;
  leftover: BigNumber;
  matchedRewards: BigNumber;
  operationalCost: BigNumber;
  patronsRewards: BigNumber;
  stakingProceeds: BigNumber;
  totalEffectiveDeposit: BigNumber;
  totalRewards: BigNumber;
  totalWithdrawals: BigNumber;
};

export default function useEpochInfo(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochInfo, any>,
): UseQueryResult<EpochInfo> {
  return useQuery(QUERY_KEYS.epochInfo(epoch), () => apiGetEpochInfo(epoch), {
    select: response => ({
      individualRewards: parseUnits(response.individualRewards, 'wei'),
      leftover: response.leftover ? parseUnits(response.leftover, 'wei') : BigNumber.from(0),
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
    }),
    ...options,
  });
}
