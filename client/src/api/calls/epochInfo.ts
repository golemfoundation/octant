import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  communityFund: string | null;
  donatedToProjects: string | null;
  leftover: string | null;
  matchedRewards: string | null;
  operationalCost: string;
  patronsRewards: string | null;
  ppf: string | null;
  stakingProceeds: string;
  totalEffectiveDeposit: string;
  totalRewards: string;
  totalWithdrawals: string | null;
  vanillaIndividualRewards: string;
};

export async function apiGetEpochInfo(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}epochs/info/${epoch}`, { signal })
    .then(({ data }) => data);
}
