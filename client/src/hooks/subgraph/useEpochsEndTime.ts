import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'graphql-request';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetEpochsEndTimeQuery } from 'gql/graphql';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

type EpochsEndTime = {
  epoches: {
    epoch: number;
    // timestamp
    toTs: string;
  }[];
};

const GET_EPOCHS_END_TIME = graphql(`
  query GetEpochsEndTime($lastEpoch: Int) {
    epoches(first: $lastEpoch) {
      epoch
      toTs
    }
  }
`);

export default function useEpochsEndTime(): UseQueryResult<EpochsEndTime['epoches'] | null> {
  const { subgraphAddress } = env;
  const { data: currentEpoch } = useCurrentEpoch();

  return useQuery<GetEpochsEndTimeQuery, any, EpochsEndTime['epoches'] | null, any>(
    QUERY_KEYS.epochesEndTime(currentEpoch!),
    async () =>
      request(subgraphAddress, GET_EPOCHS_END_TIME, {
        lastEpoch: currentEpoch,
      }),
    {
      enabled: !!currentEpoch,
      refetchOnMount: false,
      select: data => data.epoches,
    },
  );
}
