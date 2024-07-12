import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  uniquenessQuotient: string;
};

export async function apiGetUqScore(address: string, epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}user/${address}/uq/${epoch}`)
    .then(({ data }) => data);
}
