import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  expires_at: string;
  score: string;
  status: string;
};

export async function apiGetAntisybilStatus(userAddress: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}user/${userAddress}/antisybil-status`)
    .then(({ data }) => data);
}

export async function apiPutAntisybilStatus(userAddress: string): Promise<void> {
  return apiService.put(`${env.serverEndpoint}user/${userAddress}/antisybil-status`);
}
