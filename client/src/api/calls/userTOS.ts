import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  accepted: boolean;
};

export function apiGetUserTOS(address: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}user/${address}/tos`)
    .then(({ data: response }) => response);
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function apiPostUserTOS(address: string, data: any): Promise<Response> {
  return apiService
    .post(`${env.serverEndpoint}user/${address}/tos`, data)
    .then(({ data: response }) => response);
}
