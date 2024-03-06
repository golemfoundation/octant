import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  addresses: string[];
  value: string; // WEI
};

export function apiGetEpochUnusedRewards(epoch: number): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}rewards/unused/${epoch}`).then(({ data }) => data);
}
