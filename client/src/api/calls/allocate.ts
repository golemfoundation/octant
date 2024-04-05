import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type ApiPostAllocateLeverageData = {
  allocations: {
    amount: string; // WEI
    proposalAddress: string;
  }[];
};

export type LeverageMatched = {
  address: string;
  value: string; // WEI
};

export type ApiPostAllocateLeverageResponse = {
  // Float as a string, at least 15 decimal places.
  leverage: string;
  matched: LeverageMatched[];
  threshold: string; // WEI
};

export type ApiGetUserAllocationNonceResponse = {
  allocationNonce: number;
};

export async function apiPostAllocateLeverage(
  allocateData: ApiPostAllocateLeverageData,
  userAddress: string,
  signal: GenericAbortSignal,
): Promise<ApiPostAllocateLeverageResponse> {
  return apiService
    .post(`${env.serverEndpoint}allocations/leverage/${userAddress}`, allocateData, { signal })
    .then(({ data }) => data);
}

export async function apiGetUserAllocationNonce(
  userAddress: string,
): Promise<ApiGetUserAllocationNonceResponse> {
  return apiService
    .get(`${env.serverEndpoint}allocations/users/${userAddress}/allocation_nonce`)
    .then(({ data }) => data);
}
