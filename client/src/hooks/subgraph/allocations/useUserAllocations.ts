import { useQuery, UseQueryResult } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import request from 'graphql-request';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

import { AllocationSquashed } from './types';
import { parseAllocations } from './utils';

const GET_USER_ALLOCATIONS = graphql(`
  query GetUserAllocations($userAddress: Bytes!) {
    allocateds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      ...AllocatedFields
    }
  }
`);

export default function useUserAllocations(): UseQueryResult<AllocationSquashed[]> {
  const { subgraphAddress } = env;
  const { address } = useAccount();

  const { data, ...rest } = useQuery(
    QUERY_KEYS.userHistoricAllocations(address!),
    async () =>
      request(subgraphAddress, GET_USER_ALLOCATIONS, {
        userAddress: address!,
      }),
    {
      enabled: !!address,
      refetchOnMount: false,
    },
  );

  // @ts-expect-error resolve typing issue.
  return {
    // @ts-expect-error resolve typing issue.
    data: parseAllocations(data?.allocateds),
    ...rest,
  };
}
