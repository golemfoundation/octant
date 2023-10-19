import env from 'env';
import apiService from 'services/apiService';

export type ApiPatronModeResponse = {
  status: boolean;
};

export function apiPatchPatronMode(
  userAddress: string,
  signature: `0x${string}`,
): Promise<ApiPatronModeResponse> {
  return apiService
    .patch(`${env.serverEndpoint}user/${userAddress}/patron-mode`, { signature })
    .then(({ data }) => data);
}

export function apiGetPatronMode(userAddress: string): Promise<ApiPatronModeResponse> {
  return apiService
    .get(`${env.serverEndpoint}user/${userAddress}/patron-mode`)
    .then(({ data }) => data);
}
