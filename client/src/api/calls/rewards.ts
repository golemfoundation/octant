import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  rewards: {
    address: string;
    allocated: string;
    matched: string;
  }[];
};

export async function apiGetEstimatedMatchedProjectRewards(): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/proposals/estimated`)
    .then(({ data }) => data);
}

export async function apiGetMatchedProjectRewards(epoch: number): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/proposals/epoch/${epoch}`)
    .then(({ data }) => data);
}
