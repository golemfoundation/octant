import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  addresses: string[];
  value: string; // WEI
};

export async function apiGetEpochUnusedRewards(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/unused/${epoch}`, { signal })
    .then(({ data }) => data);
}
