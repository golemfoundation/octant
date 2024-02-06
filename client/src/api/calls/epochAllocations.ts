import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  allocations: {
    amount: string; // WEI
    donor: string; // address
    proposal: string; // proposal address
  }[];
};

export function apiGetEpochAllocations(epoch: number): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}allocations/epoch/${epoch}`).then(({ data }) => data);
}
