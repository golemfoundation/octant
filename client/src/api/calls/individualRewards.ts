import env from 'env';
import apiService from 'services/apiService';

export type Response = { budget: string };

export function apiGetIndividualRewards(epoch: number, address: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/budget/${address}/epoch/${epoch}`)
    .then(({ data }) => data);
}
