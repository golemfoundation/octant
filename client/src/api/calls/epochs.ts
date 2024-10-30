import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  currentEpoch: number;
};

export async function apiGetCurrentEpoch(): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}epochs/current`).then(({ data }) => data);
}
