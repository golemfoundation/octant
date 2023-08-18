import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetMatchedProposalRewards, Response } from 'api/calls/matchedProposalRewards';
import { QUERY_KEYS } from 'api/queryKeys';

import useCurrentEpoch from './useCurrentEpoch';

export type ProposalRewards = {
  address: string;
  allocated: BigNumber;
  matched: BigNumber;
  percentage: number;
  sum: BigNumber;
};

export default function useMatchedProposalRewards(
  options?: UseQueryOptions<Response, unknown, ProposalRewards[], any>,
): UseQueryResult<ProposalRewards[]> {
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.matchedProposalRewards,
    () => apiGetMatchedProposalRewards(currentEpoch! - 1),
    {
      enabled: !!currentEpoch && currentEpoch > 1,
      select: response => {
        const totalDonations = response?.rewards.reduce(
          (acc, { allocated, matched }) => acc.add(parseUnits(allocated)).add(parseUnits(matched)),
          BigNumber.from(0),
        );
        return response?.rewards.map(({ address, allocated, matched }) => {
          const allocatedBigNum = parseUnits(allocated);
          const matchedBigNum = parseUnits(matched);

          const sum = allocatedBigNum.add(matchedBigNum);
          const percentage =
            !totalDonations!.isZero() && !sum.isZero()
              ? sum.mul(100).div(totalDonations!).toNumber()
              : 0;
          return {
            address,
            allocated: allocatedBigNum,
            matched: matchedBigNum,
            percentage,
            sum,
          };
        });
      },
      ...options,
    },
  );
}
