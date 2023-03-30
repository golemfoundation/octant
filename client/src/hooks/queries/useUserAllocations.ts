import { BigNumber } from 'ethers';
import { UseQueryOptions, UseQueryResult, useQuery } from 'react-query';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractAllocationsStorage from 'hooks/contracts/useContractAllocationsStorage';

import useCurrentEpoch from './useCurrentEpoch';

import { IAllocationsStorage } from '../../typechain-types';

export type UserAllocation = { allocation: BigNumber; proposalAddress: string };

export default function useUserAllocations(
  options?: UseQueryOptions<
    IAllocationsStorage.AllocationStructOutput[] | undefined,
    unknown,
    UserAllocation[] | undefined,
    string[]
  >,
): UseQueryResult<UserAllocation[] | undefined> {
  const { address } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const contractAllocationsStorage = useContractAllocationsStorage();

  return useQuery(
    QUERY_KEYS.userAllocations,
    () => contractAllocationsStorage?.getUserAllocations(currentEpoch! - 1, address!),
    {
      enabled: !!currentEpoch && currentEpoch > 1 && !!address,
      select: response =>
        response?.map(element => ({
          allocation: element[1],
          proposalAddress: element[0],
        })),
      ...options,
    },
  );
}
