import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  allocations: {
    amount: string; // WEI
    donor: string; // address
    project: string; // project address
  }[];
};

export async function apiGetEpochAllocations(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}allocations/epoch/${epoch}`, { signal })
    .then(({ data }) => data);
}
