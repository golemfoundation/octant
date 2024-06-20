import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // Donor address
  address: string;
  // Donation in WEI
  amount: string;
}[];

export async function apiGetProjectDonors(
  projectAddress: string,
  epoch: number,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}allocations/project/${projectAddress}/epoch/${epoch}`)
    .then(({ data }) => data);
}
