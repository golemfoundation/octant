import { useQuery, UseQueryResult } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import request from 'graphql-request';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

export type Unlock = {
  amount: string;
  blockTimestamp: number;
  type: 'Unlock';
};

const GET_UNLCOKS = graphql(`
  query GetUnlocks($userAddress: Bytes!) {
    unlockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`);

export default function useUnlocks(): UseQueryResult<Unlock[]> {
  const { subgraphAddress } = env;
  const { address } = useAccount();

  const { data, ...rest } = useQuery(
    QUERY_KEYS.unlocks,
    async () => request(subgraphAddress, GET_UNLCOKS, { userAddress: address! }),
    {
      // @ts-expect-error Requests to subgraph are disabled in Cypress before transition to the server is done.
      enabled: !!address && window.Cypress === undefined,
      refetchOnMount: false,
    },
  );

  // @ts-expect-error resolve typing issue.
  return {
    data: data?.unlockeds.map(({ blockTimestamp, ...elementRest }) => ({
      ...elementRest,
      // @ts-expect-error resolve typing issue.
      blockTimestamp: parseInt(blockTimestamp, 10) * 1000,
      type: 'Unlock',
    })),
    ...rest,
  };
}
