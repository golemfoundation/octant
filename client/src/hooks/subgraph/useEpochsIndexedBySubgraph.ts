import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetEpochesQuery } from 'gql/graphql';

const GET_EPOCHS = graphql(`
  query GetEpoches {
    epoches {
      epoch
    }
  }
`);

export default function useEpochsIndexedBySubgraph(isEnabled?: boolean): UseQueryResult<number[]> {
  const { subgraphAddress } = env;

  return useQuery<GetEpochesQuery, any, number[], any>({
    enabled: isEnabled,
    queryFn: async () => request(subgraphAddress, GET_EPOCHS),
    queryKey: QUERY_KEYS.epochsIndexedBySubgraph,
    refetchInterval: isEnabled ? 2000 : false,
    select: data => data.epoches.map(({ epoch }) => epoch),
  });
}
