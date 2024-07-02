import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  primary: string;
  secondary: string;
};

export async function apiGetDelegationCheck(addresses: NonNullable<string[]>): Promise<Response> {
  return apiService
    .get(`${env.cryptoValuesEndpoint}/delegation/check/${addresses}`)
    .then(({ data }) => data);
}
