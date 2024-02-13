import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { apiGetEpochBudgets, Response } from 'api/calls/epochBudgets';
import { QUERY_KEYS } from 'api/queryKeys';

type EpochBudgets = {
  budgets: {
    budget: BigNumber;
    user: string;
  }[];
  budgetsSum: BigNumber;
};

export default function useEpochBudgets(
  epoch: number,
  options?: UseQueryOptions<Response, unknown, EpochBudgets, any>,
): UseQueryResult<EpochBudgets, unknown> {
  return useQuery({
    queryFn: () => apiGetEpochBudgets(epoch),
    queryKey: QUERY_KEYS.epochBudgets(epoch),
    select: response => {
      let budgetsSum = BigNumber.from(0);

      const budgets = response.budgets.map(({ address, amount }) => {
        const budgetBigNumber = parseUnits(amount, 'wei');
        budgetsSum = budgetsSum.add(budgetBigNumber);
        return {
          budget: budgetBigNumber,
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
