import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  rewardsRate: number;
};

export async function apiGetRewardsRate(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}epochs/rewards-rate/${epoch}`, { signal })
    .then(({ data }) => data);
}
