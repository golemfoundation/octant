import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  individualRewards: string;
  leftover: string | null;
  matchedRewards: string | null;
  operationalCost: string;
  patronsRewards: string | null;
  stakingProceeds: string;
  totalEffectiveDeposit: string;
  totalRewards: string;
  totalWithdrawals: string | null;
};

export async function apiGetEpochInfo(epoch: number): Promise<Response> {
  return apiService.get(`${env.serverEndpoint}epochs/info/${epoch}`).then(({ data }) => data);
}
