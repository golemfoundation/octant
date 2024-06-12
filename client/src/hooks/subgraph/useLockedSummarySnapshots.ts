import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLockedSummarySnapshotsQuery } from 'gql/graphql';
import getMetricsChartDataGroupedByDate, {
  GroupedGlmAmountByDateItem,
} from 'utils/getMetricsChartDataGroupedByDate';

const GET_LOCKED_SUMMARY_SNAPSHOTS = graphql(`
  query GetLockedSummarySnapshots($first: Int = 1000, $skip: Int = 0) {
    lockedSummarySnapshots(first: $first, skip: $skip, orderBy: timestamp) {
      lockedTotal
      timestamp
    }
  }
`);

type GroupedByDateItem = {
  cumulativeGlmAmount: number;
  dateTime: number;
};

type GroupedByDate = GroupedByDateItem[];

type UseLockedSummarySnapshotsResponse =
  | {
      groupedByDate: GroupedByDate;
    }
  | undefined;

export default function useLockedSummarySnapshots(): UseQueryResult<UseLockedSummarySnapshotsResponse> {
  const { subgraphAddress } = env;

  return useQuery<GetLockedSummarySnapshotsQuery, any, UseLockedSummarySnapshotsResponse, any>({
    queryFn: async () => {
      const pageSize = 1000;
      const lockedSummarySnapshots: GetLockedSummarySnapshotsQuery['lockedSummarySnapshots'] = [];

      const fetchPage = async (first: number) => {
        const data = await request(subgraphAddress, GET_LOCKED_SUMMARY_SNAPSHOTS, {
          first: pageSize,
          skip: first - pageSize,
        });

        lockedSummarySnapshots.push(...data.lockedSummarySnapshots);

        if (data.lockedSummarySnapshots.length >= pageSize) {
          await fetchPage(first + pageSize);
        }
      };

      await fetchPage(pageSize);

      return { lockedSummarySnapshots };
    },
    queryKey: QUERY_KEYS.lockedSummarySnapshots,
    refetchOnMount: false,
    select: data => {
      if (!data?.lockedSummarySnapshots) {
        return undefined;
      }

      const groupedByDate = getMetricsChartDataGroupedByDate(
        data.lockedSummarySnapshots,
        'lockedSummarySnapshots',
      ) as GroupedGlmAmountByDateItem[];

      return {
        groupedByDate,
      };
    },
  });
}
