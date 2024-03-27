import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  patrons: string[];
};

export async function apiGetEpochPatrons(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}user/patrons/${epoch}`, { signal })
    .then(({ data }) => data);
}
