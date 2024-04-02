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

export default function useEpochs(): UseQueryResult<number[]> {
  const { subgraphAddress } = env;

  return useQuery<GetEpochesQuery, any, number[], any>({
    queryFn: async () => request(subgraphAddress, GET_EPOCHS),
    queryKey: QUERY_KEYS.epochs,
    select: data => data.epoches.map(element => element.epoch),
  });
}
