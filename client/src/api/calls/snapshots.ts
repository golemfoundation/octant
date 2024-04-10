import env from 'env';
import apiService from 'services/apiService';

export async function apiPostSnapshotsPending(): Promise<any> {
  return apiService.post(`${env.serverEndpoint}snapshots/pending`)
}

export async function apiPostSnapshotsFinalized(): Promise<any> {
  return apiService.post(`${env.serverEndpoint}snapshots/finalized`)
}
