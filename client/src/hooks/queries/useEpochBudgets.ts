import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetEpochBudgets, Response } from 'api/calls/epochBudgets';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type EpochBudgets = {
  budgets: {
    budget: bigint;
    user: string;
  }[];
  budgetsSum: bigint;
};

export default function useEpochBudgets(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochBudgets, any>,
): UseQueryResult<EpochBudgets, unknown> {
  return useQuery({
    queryFn: ({ signal }) => apiGetEpochBudgets(epoch, signal),
    queryKey: QUERY_KEYS.epochBudgets(epoch),
    select: response => {
      let budgetsSum = BigInt(0);

      const budgets = response.budgets.map(({ address, amount }) => {
        const budgetBigInt = parseUnitsBigInt(amount, 'wei');
        budgetsSum += budgetBigInt;
        return {
          budget: budgetBigInt,
          user: address,
        };
      });

      return {
        budgets,
        budgetsSum,
      };
    },
    ...options,
  });
}
