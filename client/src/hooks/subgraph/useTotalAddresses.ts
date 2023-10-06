import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetTotalAddressesQuery } from 'gql/graphql';

const GET_TOTAL_ADDRESSES = graphql(`
  query GetTotalAddresses {
    lockeds(first: 1000) {
      user
    }
  }
`);

export default function useTotalAddresses(): UseQueryResult<number | undefined> {
  const { subgraphAddress } = env;

  return useQuery<GetTotalAddressesQuery, any, number | undefined, any>(
    QUERY_KEYS.totalAddresses,
    async () => request(subgraphAddress, GET_TOTAL_ADDRESSES),
    {
      refetchOnMount: false,
      select: data => {
        if (!data?.lockeds) {
          return undefined;
        }
        const totalAddressesWithoutDuplicates = new Set(data.lockeds.map(({ user }) => user)).size;

        return totalAddressesWithoutDuplicates;
      },
    },
  );
}
