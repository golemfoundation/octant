import env from 'env';
import apiService from 'services/apiService';

export type ApiPostAllocateLeverageData = {
  allocations: {
    // WEI
    amount: string;
    proposalAddress: string;
  }[];
};

export type ApiPostAllocateLeverageResponse = {
  // Float as a string, at least 15 decimal places.
  leverage: string;
};

export type ApiGetUserAllocationNonceResponse = {
  allocationNonce: number;
};

export function apiPostAllocateLeverage(
  allocateData: ApiPostAllocateLeverageData,
  userAddress: string,
): Promise<ApiPostAllocateLeverageResponse> {
  return apiService
    .post(`${env.serverEndpoint}allocations/leverage/${userAddress}`, allocateData)
    .then(({ data }) => data);
}

export function apiGetUserAllocationNonce(
  userAddress: string,
): Promise<ApiGetUserAllocationNonceResponse> {
  return apiService
    .get(`${env.serverEndpoint}allocations/users/${userAddress}/allocation_nonce`)
    .then(({ data }) => data);
}
