import env from 'env';
import apiService from 'services/apiService';

export type GetUserAllocationsResponse = {
  allocations: {
    address: string;
    // Funds allocated by user for the project in WEI
    amount: string;
  }[];
  isManuallyEdited: boolean | null;
};

export async function apiGetUserAllocations(
  address: string,
  epoch: number,
): Promise<GetUserAllocationsResponse> {
  return apiService
    .get(`${env.serverEndpoint}allocations/user/${address}/epoch/${epoch}`)
    .then(({ data }) => data);
}

export type AllocationsPerProjectResponse = {
  address: string;
  amount: string;
}[];

export async function apiGetAllocationsPerProject(
  projectAddress: string,
  epoch: number,
): Promise<AllocationsPerProjectResponse> {
  return apiService
    .get(`${env.serverEndpoint}allocations/project/${projectAddress}/epoch/${epoch}`)
    .then(({ data }) => data);
}
