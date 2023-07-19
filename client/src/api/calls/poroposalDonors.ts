import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // Donor address
  address: string;
  // Donation in WEI
  amount: string;
}[];

export function apiGetProposalDonors(proposalAddress: string, epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}allocations/proposal/${proposalAddress}/epoch/${epoch}`)
    .then(({ data }) => data);
}
