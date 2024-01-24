import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  allocations: {
    address: string;
    // Funds allocated by user for the proposal in WEI
    amount: string;
  }[];
  isManuallyEdited: boolean | null;
};

export function apiGetUserAllocations(address: string, epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}allocations/user/${address}/epoch/${epoch}`)
    .then(({ data }) => data);
}
