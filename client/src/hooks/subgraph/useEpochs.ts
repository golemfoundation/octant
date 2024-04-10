import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

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

export default function useEpochs(isEnabled?: boolean): UseQueryResult<number[]> {
  const { subgraphAddress } = env;

  return useQuery<GetEpochesQuery, any, number[], any>({
    enabled: isEnabled,
    queryFn: async () => request(subgraphAddress, GET_EPOCHS),
    queryKey: QUERY_KEYS.epochs,
    refetchInterval: isEnabled ? 2000 : false,
    select: data => data.epoches.map(({ epoch }) => epoch),
  });
}
