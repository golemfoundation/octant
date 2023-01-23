import { BigNumber } from 'ethers';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { useMetamask } from 'use-metamask';

import useContractAllocationsStorage from './contracts/useContractAllocationsStorage';
import useCurrentEpoch from './useCurrentEpoch';

import { IAllocationsStorage } from '../../../typechain-types';

export type UserAllocation = { allocation: BigNumber; proposalId: number };

export default function useUserAllocations(
  options?: UseQueryOptions<
    IAllocationsStorage.AllocationStructOutput[] | undefined,
    unknown,
    UserAllocation[] | undefined,
    string[]
  >,
): UseQueryResult<UserAllocation[] | undefined> {
  const {
    metaState: { account },
  } = useMetamask();
  const contractAllocationsStorage = useContractAllocationsStorage();
  const { data: currentEpoch } = useCurrentEpoch();

  const address = account[0];

  return useQuery(
    ['userAllocations'],
    () => contractAllocationsStorage?.getUserAllocations(currentEpoch! - 1, address),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!address,
      select: response =>
        response?.map<UserAllocation>(element => ({
          allocation: element![1],
          proposalId: element![0]?.toNumber(),
        })),
      ...options,
    },
  );
}
