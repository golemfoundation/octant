import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractRewards from 'hooks/contracts/useContractRewards';

import useCurrentEpoch from './useCurrentEpoch';

export interface IndividualProposalRewards {
  projects: {
    address: string;
    donated: BigNumber;
    matched: BigNumber;
  }[];
  sum: BigNumber;
}

export default function useIndividualProposalRewards(): UseQueryResult<IndividualProposalRewards> {
  const { data: currentEpoch } = useCurrentEpoch();
  const contractRewards = useContractRewards();

  return useQuery(
    QUERY_KEYS.individualProposalRewards,
    () => contractRewards?.individualProposalRewards(currentEpoch! - 1),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!contractRewards,
      select: response => ({
        projects: response![1].map(([address, donated, matched]) => ({
          address,
          donated,
          matched,
        })),
        sum: response![0],
      }),
    },
  );
}
