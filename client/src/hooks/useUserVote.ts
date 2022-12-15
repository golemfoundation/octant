import { UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import env from 'env';

import useAllocationsStorageContract from './contracts/useAllocationsStorageContract';
import useCurrentEpoch from './useCurrentEpoch';

export type UserVote = { alpha: number; proposalId: number };

export default function useUserVote(): UseQueryResult<UserVote> {
  const { allocationsStorageAddress } = env;
  const {
    metaState: { account },
  } = useMetamask();
  const address = account[0];

  const { data: currentEpoch } = useCurrentEpoch();
  const contractAllocationsStorage = useAllocationsStorageContract(allocationsStorageAddress);

  return useQuery(
    ['userVote'],
    () => contractAllocationsStorage?.getUserVote(currentEpoch!, address),
    {
      enabled: !!currentEpoch && !!address,
      select: response => ({
        alpha: response!.alpha.toNumber(),
        proposalId: response!.proposalId.toNumber(),
      }),
    },
  );
}
