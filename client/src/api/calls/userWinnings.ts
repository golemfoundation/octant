import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  winnings: {
    amount: string;
    dateAvailableForWithdrawal: string;
  }[];
};

export async function apiGetUserRaffleWinnings(address: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}user/${address}/raffle/winnings`)
    .then(({ data }) => data);
}
