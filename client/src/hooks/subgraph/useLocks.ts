import { useQuery, UseQueryResult } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import request from 'graphql-request';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

export type Lock = {
  amount: string;
  blockTimestamp: number;
  type: 'Lock';
};

const GET_LOCKS = graphql(`
  query GetLocks($userAddress: Bytes!) {
    lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`);

export default function useLocks(): UseQueryResult<Lock[]> {
  const { subgraphAddress } = env;
  const { address } = useAccount();

  const { data, ...rest } = useQuery(
    QUERY_KEYS.locks,
    async () => request(subgraphAddress, GET_LOCKS, { userAddress: address! }),
    {
      enabled: !!address,
      refetchOnMount: false,
    },
  );

  // @ts-expect-error resolve typing issue.
  return {
    data: data?.lockeds.map(({ blockTimestamp, ...elementRest }) => ({
      ...elementRest,
      // @ts-expect-error resolve typing issue.
      blockTimestamp: parseInt(blockTimestamp, 10) * 1000,
      type: 'Lock',
    })),
    ...rest,
  };
}
