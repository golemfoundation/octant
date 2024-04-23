import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type PostCalculateRewardsResponse = {
  budget: string; // WEI
  matchedFunding: string; // WEI
};

export async function apiPostCalculateRewards(
  // WEI
  amount: string,
  numberOfEpochs: number,
  signal: GenericAbortSignal,
): Promise<PostCalculateRewardsResponse> {
  return apiService
    .post(
      `${env.serverEndpoint}rewards/estimated_budget`,
      {
        glmAmount: amount,
        numberOfEpochs,
      },
      {
        signal,
      },
    )
    .then(({ data }) => data);
}
