import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // User allocations sum in WEI
  amount: string;
};

export function apiGetUsersAllocationsSum(): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}allocations/users/sum`).then(({ data }) => data);
}
