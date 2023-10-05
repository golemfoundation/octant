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
  epoch?: number,
  options?: UseQueryOptions<Response, unknown, ProposalRewards[], any>,
): UseQueryResult<ProposalRewards[]> {
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    epoch || currentEpoch
      ? QUERY_KEYS.matchedProposalRewards(epoch ? epoch - 1 : currentEpoch! - 1)
      : [''],
    () => apiGetMatchedProposalRewards(epoch ? epoch - 1 : currentEpoch! - 1),
    {
      enabled: epoch !== undefined || (!!currentEpoch && currentEpoch > 1),
      select: response => {
        const totalDonations = response?.rewards.reduce(
          (acc, { allocated, matched }) => acc.add(parseUnits(allocated)).add(parseUnits(matched)),
          BigNumber.from(0),
        );
        return response?.rewards.map(({ address, allocated, matched }) => {
          const allocatedBigNum = parseUnits(allocated, 'wei');
          const matchedBigNum = parseUnits(matched, 'wei');

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
