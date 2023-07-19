import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  address: string;
  allocated: string;
  matched: string;
}[];

export function apiGetMatchedProposalRewards(epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/proposals/epoch/${epoch}`)
    .then(({ data }) => data);
}
