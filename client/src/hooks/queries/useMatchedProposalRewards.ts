import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export type ProposalRewards = {
  address: string;
  donated: BigNumber;
  matched: BigNumber;
  percentage: number;
  sum: BigNumber;
};

export default function useMatchedProposalRewards(): UseQueryResult<ProposalRewards[] | undefined> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    QUERY_KEYS.matchedProposalRewards,
    () => contractRewards?.matchedProposalRewards(currentEpoch! - 1),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!contractRewards,
      select: response => {
        // Response structure: [address, donated, matched][]
        const totalDonations = response?.reduce(
          (acc, [_id, donated, matched]) => acc.add(donated).add(matched),
          BigNumber.from(0),
        );
        return response?.map(([address, donated, matched]) => {
          const sum = donated.add(matched);
          const percentage =
            !totalDonations!.isZero() && !sum.isZero()
              ? sum.mul(100).div(totalDonations!).toNumber()
              : 0;
          return {
            address,
            donated,
            matched,
            percentage,
            sum,
          };
        });
      },
    },
  );
}
