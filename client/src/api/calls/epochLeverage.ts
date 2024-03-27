import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  leverage: number;
};

export async function apiGetEpochLeverage(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}rewards/leverage/${epoch}`, { signal })
    .then(({ data }) => data);
}
