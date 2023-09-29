import env from 'env';
import apiService from 'services/apiService';

export type ResponseHistoryItem = {
  // BigNumber (wei) string
  amount: string;
  timestamp: string;
  type: 'lock' | 'unlock' | 'allocation' | 'withdrawal';
};

export type Response = { history: ResponseHistoryItem[]; next_cursor?: string };

export function apiGetHistory(address: string, cursor?: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}history/${address}?limit=12${cursor ? `&cursor=${cursor}` : ''}`)
    .then(({ data }) => data);
}
