import env from 'env';
import apiService from 'services/apiService';

export type DelegateProps = {
  primaryAddress: string;
  primaryAddressSignature: string;
  secondaryAddress: string;
  secondaryAddressSignature: string;
};

export type Response = {
  primary: string;
  secondary: string;
};

export async function apiPostDelegate({
  primaryAddress,
  secondaryAddress,
  primaryAddressSignature,
  secondaryAddressSignature,
}: DelegateProps): Promise<Response> {
  return apiService.post(`${env.serverEndpoint}/delegation/delegate`, {
    primaryAddr: primaryAddress,
    primaryAddrSignature: primaryAddressSignature,
    secondaryAddr: secondaryAddress,
    secondaryAddrSignature: secondaryAddressSignature,
  });
}
