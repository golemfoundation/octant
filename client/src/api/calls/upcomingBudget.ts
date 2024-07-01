import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  upcomingBudget: string; // WEI
};

export async function apiGetUpcomingBudget(address: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/budget/${address}/upcoming`)
    .then(({ data }) => data);
}
