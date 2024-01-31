import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  budget: string; // WEI
  user: string; // address
}[];

export function apiGetEpochBudgets(epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/budgets/epoch/${epoch}`)
    .then(({ data }) => data);
}
