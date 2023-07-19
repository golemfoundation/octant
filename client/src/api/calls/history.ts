import env from 'env';
import apiService from 'services/apiService';

type HistoryItem = {
  // BigNumber (wei) string
  amount: string;
  timestamp: string;
  type: 'lock' | 'unlock' | 'allocation' | 'withdrawal';
};

export type Response = { history: HistoryItem[] };

export function apiGetHistory(address: string): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}history${address}`).then(({ data }) => data);
}
