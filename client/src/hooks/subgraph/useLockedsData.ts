import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLockedsDataQuery } from 'gql/graphql';
import getMetricsChartDataGroupedByDate, {
  GroupedUsersByDateItem,
} from 'utils/getMetricsChartDataGroupedByDate';

const GET_LOCKEDS_DATA = graphql(`
  query GetLockedsData($first: Int = 100, $skip: Int = 0) {
    lockeds(first: $first, skip: $skip) {
      user
      timestamp
      amount
    }
  }
`);

type GroupedByDateItem = {
  dateTime: number;
  users: `0x${string}`[];
};

type GroupedByDate = GroupedByDateItem[];

type UseLockedsDataResponse =
  | {
      groupedByDate: GroupedByDate;
      totalAddresses: number;
    }
  | undefined;

export default function useLockedsData(): UseQueryResult<UseLockedsDataResponse> {
  const { subgraphAddress } = env;

  return useQuery<GetLockedsDataQuery, any, UseLockedsDataResponse, any>({
    queryFn: async () => {
      const pageSize = 1000;
      const lockeds: GetLockedsDataQuery['lockeds'] = [];

      const fetchPage = async (first: number) => {
        const data = await request(subgraphAddress, GET_LOCKEDS_DATA, {
          first: pageSize,
          skip: first - pageSize,
        });

        lockeds.push(...data.lockeds);

        if (data.lockeds.length >= pageSize) {
          await fetchPage(first + pageSize);
        }
      };

      await fetchPage(pageSize);

      return { lockeds };
    },
    queryKey: QUERY_KEYS.totalAddresses,
    refetchOnMount: false,
    select: data => {
      if (!data?.lockeds?.length) {
        return undefined;
      }

      const groupedByDate = getMetricsChartDataGroupedByDate(
        data.lockeds,
        'lockeds',
      ) as GroupedUsersByDateItem[];

      const totalAddressesWithoutDuplicates = groupedByDate[groupedByDate.length - 1].users.length;

      return {
        groupedByDate,
        totalAddresses: totalAddressesWithoutDuplicates,
      };
    },
  });
}
