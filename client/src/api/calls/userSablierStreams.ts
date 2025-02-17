import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  sablierStreams: {
    amount: string;
    dateAvailableForWithdrawal: string;
    isCancelled: boolean;
    recipientAddress: string;
    remainingAmount: string;
  }[];
};

export async function apiGetUserSablierStreams(address: string): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}user/${address}/sablier-streams`)
    .then(({ data }) => data);
}

export async function apiGetAllSablierStreams(): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}user/sablier-streams/all`).then(({ data }) => data);
}
