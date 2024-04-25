import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  count: number;
};

export async function apiGetSafeMessages(
  address: string,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.safeEndpoint}api/v1/safes/${address}/messages/`, {
      signal,
    })
    .then(({ data }) => data);
}
