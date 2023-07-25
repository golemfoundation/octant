import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // Value in WEI.
  threshold: string;
};

export function apiGetProjectThreshold(epoch: number): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}rewards/threshold/${epoch}`).then(({ data }) => data);
}
