import env from 'env';
import apiService from 'services/apiService';

export type ResponseHistoryItem = {
  // (wei) string
  amount: string;
  projectAddress?: string;
  timestamp: string;
  transactionHash?: string;
  type: 'lock' | 'unlock' | 'allocation' | 'withdrawal' | 'patron_mode_donation';
};

export type Response = { history: ResponseHistoryItem[]; nextCursor?: string };

export async function apiGetHistory(address: string, cursor?: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}history/${address}?limit=12${cursor ? `&cursor=${cursor}` : ''}`)
    .then(({ data }) => data);
}
