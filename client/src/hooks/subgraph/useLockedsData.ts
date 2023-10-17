import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getTime, startOfDay } from 'date-fns';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import request from 'graphql-request';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { GetLockedsDataQuery } from 'gql/graphql';

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
  cummulativeGlmAmount: number;
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

  return useQuery<GetLockedsDataQuery, any, UseLockedsDataResponse, any>(
    QUERY_KEYS.totalAddresses,
    async () => {
      const pageSize = 1000;
      const lockeds: GetLockedsDataQuery['lockeds'] = [];

      const fetchPage = async (first: number) => {
        const data = await request(subgraphAddress, GET_LOCKEDS_DATA, {
          first,
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
    {
      refetchOnMount: false,
      select: data => {
        if (!data?.lockeds) {
          return undefined;
        }

        const groupedByDate = sortBy(data.lockeds, l => l.timestamp).reduce<GroupedByDate>(
          (acc, curr) => {
            // formatting from WEI to GLM (int)
            const glmAmount = parseFloat(formatUnits(parseUnits(curr.amount, 'wei')));

            // grouping by start of day in user's timezone
            const dateTime = getTime(startOfDay(curr.timestamp * 1000));

            const idx = acc.findIndex(v => v.dateTime === dateTime);
            if (idx < 0) {
              acc.push({
                cummulativeGlmAmount:
                  acc.length > 0 ? acc[acc.length - 1].cummulativeGlmAmount + glmAmount : glmAmount,
                dateTime,
                users:
                  acc.length > 0 ? uniq([...acc[acc.length - 1].users, curr.user]) : [curr.user],
              });
              return acc;
            }

            // eslint-disable-next-line operator-assignment
            acc[idx].users = uniq([...acc[idx].users, curr.user]);
            // eslint-disable-next-line operator-assignment
            acc[idx].cummulativeGlmAmount = acc[idx].cummulativeGlmAmount + glmAmount;

            return acc;
          },
          [],
        );

        const totalAddressesWithoutDuplicates =
          groupedByDate[groupedByDate.length - 1].users.length;

        return {
          groupedByDate,
          totalAddresses: totalAddressesWithoutDuplicates,
        };
      },
    },
  );
}
