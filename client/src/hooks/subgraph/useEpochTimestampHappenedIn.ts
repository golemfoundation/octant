import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/v1/gql';
import { GetEpochTimestampHappenedInQuery } from 'gql/v1/graphql';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

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
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const timestampSecondsNumber = parseInt(timestampSeconds, 10);

  /*
   * Workaround for Cypress to return currentEpoch instead of epoch based on timestamp for testing TransactionDetails.
   * The actual timestamp in Cypress doesn't move, it always indicates epoch 0.
   */
  return useQuery<GetEpochTimestampHappenedInQuery, any, number, any>({
    enabled: window.Cypress
      ? currentEpoch !== undefined && isDecisionWindowOpen !== undefined
      : !!timestampSecondsNumber,
    queryFn: async () =>
      request(subgraphAddress, GET_EPOCH_TIMESTAMP_HAPPENED_IN, {
        timestamp: timestampSecondsNumber,
      }),
    queryKey: QUERY_KEYS.epochTimestampHappenedIn(timestampSecondsNumber),
    select: data => {
      if (window.Cypress) {
        return currentEpoch!;
      }
      return data.epoches[0].epoch;
    },
  });
}
