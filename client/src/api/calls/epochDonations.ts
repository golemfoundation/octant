import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  amount: string; // WEI
  donor: string; // address
  proposal: string; // proposal address
}[];

export function apiGetEpochDonations(epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}allocations/proposal/epoch/${epoch}`)
    .then(({ data }) => data);
}
