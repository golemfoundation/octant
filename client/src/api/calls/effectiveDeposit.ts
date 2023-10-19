import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // WEI
  effectiveDeposit: string;
};

export function apiGetEstimatedEffectiveDeposit(address: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}deposits/users/${address}/estimated_effective_deposit`)
    .then(({ data }) => data);
}
