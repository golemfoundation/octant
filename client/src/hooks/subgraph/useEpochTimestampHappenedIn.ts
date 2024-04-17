import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetEpochTimestampHappenedInQuery } from 'gql/graphql';

const GET_EPOCH_TIMESTAMP_HAPPENED_IN = graphql(`
  query GetEpochTimestampHappenedIn($timestamp: BigInt) {
    epoches(where: { fromTs_lte: $timestamp, toTs_gte: $timestamp }) {
      epoch
    }
  }
`);

export default function useEpochTimestampHappenedIn(
  timestampSeconds: string,
): UseQueryResult<number> {
  const { subgraphAddress } = env;
  const timestampSecondsNumber = parseInt(timestampSeconds, 10);

  return useQuery<GetEpochTimestampHappenedInQuery, any, number, any>({
    enabled: !!timestampSecondsNumber,
    queryFn: async () =>
      request(subgraphAddress, GET_EPOCH_TIMESTAMP_HAPPENED_IN, {
        timestamp: timestampSecondsNumber,
      }),
    queryKey: QUERY_KEYS.epochTimestampHappenedIn(timestampSecondsNumber),
    select: data => data.epoches[0].epoch,
  });
}
