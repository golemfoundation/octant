import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';
import { formatUnits } from 'ethers/lib/utils';

import useContractRewards from './contracts/useContractRewards';
import useCurrentEpoch from './useCurrentEpoch';

type ProposalRewards = {
  donated: string;
  id: number;
  matched: string;
  percentage: number;
  sum: string;
};

export default function useMatchedProposalRewards(): UseQueryResult<ProposalRewards[] | undefined> {
  const contractRewards = useContractRewards();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['matchedProposalRewards'],
    () => contractRewards?.matchedProposalRewards(currentEpoch! - 1),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!contractRewards,
      select: response => {
        // Response structure: [id, donated, matched][]
        const totalDonations = response?.reduce(
          (acc, [_id, donated, matched]) => acc.add(donated).add(matched),
          BigNumber.from(0),
        );
        return response?.map(([id, donated, matched]) => {
          const sum = donated.add(matched);
          const percentage =
            !totalDonations!.isZero() && !sum.isZero()
              ? sum.mul(100).div(totalDonations!).toNumber()
              : 0;
          return {
            donated: formatUnits(donated),
            id: id.toNumber(),
            matched: formatUnits(matched),
            percentage,
            sum: formatUnits(sum),
          };
        });
      },
    },
  );
}
