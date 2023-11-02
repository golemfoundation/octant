import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  amount: string;
  epoch: number;
  proof: any[];
  status: 'available' | 'pending';
}[];

export function apiGetWithdrawals(address: string): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}withdrawals/${address}`).then(({ data }) => data);
}
