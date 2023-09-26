import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  blockchainEpoch: number;
  blockchainHeight: number;
  finalizedSnapshot: 'not_applicable' | 'error' | 'too_early' | 'in_progress' | 'done';
  indexedEpoch: number;
  indexedHeight: number;
  pendingSnapshot: 'not_applicable' | 'error' | 'in_progress' | 'done';
};

export function apiGetSyncStatus(): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}info/sync-status`).then(({ data }) => data);
}
