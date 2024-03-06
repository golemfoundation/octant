import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  leverage: number;
};

export function apiGetEpochLeverage(epoch: number): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}rewards/leverage/${epoch}`).then(({ data }) => data);
}
