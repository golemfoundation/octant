import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  budgets: {
    // WEI
    address: string;
    amount: string; // address
  }[];
};

export async function apiGetEpochBudgets(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/budgets/epoch/${epoch}`, { signal })
    .then(({ data }) => data);
}
