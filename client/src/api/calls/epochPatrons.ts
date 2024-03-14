import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  patrons: string[];
};

export async function apiGetEpochPatrons(epoch: number): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}user/patrons/${epoch}`).then(({ data }) => data);
}
