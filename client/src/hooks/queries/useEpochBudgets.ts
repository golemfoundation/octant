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
): UseQueryResult<EpochBudgets> {
  return useQuery(QUERY_KEYS.epochBudgets(epoch), () => apiGetEpochBudgets(epoch), {
    select: response => {
      let budgetsSum = BigNumber.from(0);

      const budgets = response.map(el => {
        const budgetBigNumber = parseUnits(el.budget, 'wei');
        budgetsSum = budgetsSum.add(budgetBigNumber);
        return {
          ...el,
          budget: budgetBigNumber,
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
