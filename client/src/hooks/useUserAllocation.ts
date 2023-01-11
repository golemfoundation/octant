import { BigNumber } from 'ethers';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

import { IAllocationsStorage } from '../../../typechain-types';

export type UserAllocation = { allocation: BigNumber; proposalId: number };

export default function useUserAllocation(
  options?: UseQueryOptions<
    IAllocationsStorage.AllocationStructOutput | undefined,
    unknown,
    UserAllocation,
    string[]
  >,
): UseQueryResult<UserAllocation> {
  const {
    metaState: { account },
  } = useMetamask();
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  const address = account[0];

  return useQuery(
    ['userAllocation'],
    () => contractAllocationsStorage?.getUserAllocation(currentEpoch! - 1, address),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!address,
      select: response => ({
        allocation: response![0],
        proposalId: response![1]?.toNumber(),
      }),
      ...options,
    },
  );
}
