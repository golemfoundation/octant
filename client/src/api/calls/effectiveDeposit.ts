import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // WEI
  effectiveDeposit: string;
};

export function apiGetEffectiveDeposit(address: string, epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}deposits/users/${address}/${epoch}`)
    .then(({ data }) => data);
}
