import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

import { IAllocationsStorage } from '../../../typechain-types';

export type UserVote = { alpha: number; proposalId: number };

export default function useUserVote(
  options?: UseQueryOptions<
    IAllocationsStorage.VoteStructOutput | undefined,
    unknown,
    UserVote,
    string[]
  >,
): UseQueryResult<UserVote> {
  const {
    metaState: { account },
  } = useMetamask();
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  const address = account[0];

  return useQuery(
    ['userVote'],
    () => contractAllocationsStorage?.getUserVote(currentEpoch! - 1, address),
    {
      enabled: !!currentEpoch && currentEpoch - 1 > 0 && !!address,
      select: response => ({
        alpha: response![0]?.toNumber(),
        proposalId: response![1]?.toNumber(),
      }),
      ...options,
    },
  );
}
