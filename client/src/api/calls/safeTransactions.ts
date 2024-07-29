import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  results: {
    safeTxHash: string;
    transactionHash?: string;
  }[];
};

export async function apiGetSafeTransactions(
  address: string,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.safeEndpoint}api/v1/safes/${address}/all-transactions/`, {
      signal,
    })
    .then(({ data }) => data);
}
