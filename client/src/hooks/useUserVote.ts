import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

export type UserVote = { alpha: number; proposalId: number };

export default function useUserVote(): UseQueryResult<UserVote> {
  const {
    metaState: { account },
  } = useMetamask();
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  const address = account[0];

  return useQuery(
    ['userVote'],
    () => contractAllocationsStorage?.getUserVote(currentEpoch!.toNumber() - 1, address),
    {
      enabled: !!currentEpoch && !!address,
      select: response => ({
        alpha: response!.alpha.toNumber(),
        proposalId: response!.proposalId.toNumber(),
      }),
    },
  );
}
