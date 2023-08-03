import env from 'env';
import apiService from 'services/apiService';

export function apiPostGlmClaim(signature: string): Promise<undefined> {
  return apiService.post(`${env.serverEndpoint}glm/claim`, { signature }).then(({ data }) => data);
}

export type GetGlmClaimCheckResponse = {
  address: string;
  // Number of GLMs in wei
  claimable: string;
};

export function apiGetGlmClaimCheck(userAddress: string): Promise<GetGlmClaimCheckResponse> {
  return apiService
    .get(`${env.serverEndpoint}glm/claim/${userAddress}/check`)
    .then(({ data }) => data);
}
