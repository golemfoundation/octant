import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  // Value in WEI.
  threshold: string;
};

export async function apiGetProjectThreshold(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/threshold/${epoch}`, { signal })
    .then(({ data }) => data);
}
