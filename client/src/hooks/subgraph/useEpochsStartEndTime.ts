import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetEpochsStartEndTimeQuery } from 'gql/graphql';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

type EpochsStartEndTime = {
  epoches: {
    // decision window duration
    decisionWindow: string;
    epoch: number;
    // timestamp
    fromTs: string;
    // timestamp
    toTs: string;
  }[];
};

const GET_EPOCHS_START_END_TIME = graphql(`
  query GetEpochsStartEndTime($lastEpoch: Int) {
    epoches(first: $lastEpoch) {
      epoch
      toTs
      fromTs
      decisionWindow
    }
  }
`);

export default function useEpochsStartEndTime(): UseQueryResult<
  EpochsStartEndTime['epoches'] | null
> {
  const { subgraphAddress } = env;
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery<GetEpochsStartEndTimeQuery, any, EpochsStartEndTime['epoches'] | null, any>(
    QUERY_KEYS.epochesEndTime(currentEpoch!),
    async () =>
      request(subgraphAddress, GET_EPOCHS_START_END_TIME, {
        lastEpoch: currentEpoch,
      }),
    {
      enabled: !!currentEpoch,
      refetchOnMount: false,
      select: data => data.epoches,
    },
  );
}
