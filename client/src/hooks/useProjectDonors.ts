/* eslint-disable */
import { BigNumber } from 'ethers';
import { UseQueryResult, useQuery } from 'react-query';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

type Donor = { alpha: BigNumber; address: string };

export default function useProjectDonors(proposalId: string): UseQueryResult<Donor[]> {
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery(
    ['userAlphas', proposalId],
    () => contractAllocationsStorage?.getUsersAlphas(currentEpoch! - 1, proposalId),
    {
      enabled: !!contractAllocationsStorage && !!currentEpoch,
      select: response =>
        response![0].map((address, index) => ({
          address,
          alpha: response![1][index],
        })),
    },
  );
}
