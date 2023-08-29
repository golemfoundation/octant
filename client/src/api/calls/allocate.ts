import env from 'env';
import apiService from 'services/apiService';

export type ApiPostAllocateData = {
  payload: {
    allocations: {
      // WEI
      amount: string;
      proposalAddress: string;
    }[];
  };
  signature: string;
};

export function apiPostAllocate(allocateData: ApiPostAllocateData): Promise<any> {
  return apiService
    .post(`${env.serverEndpoint}allocations/allocate`, allocateData)
    .then(({ data }) => data);
}
