import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type PostCalculateRewardsResponse = {
  budget: string;
};

export async function apiPostCalculateRewards(
  // WEI
  amount: string,
  days: number,
  signal: GenericAbortSignal,
): Promise<PostCalculateRewardsResponse> {
  return apiService
    .post(
      `${env.serverEndpoint}rewards/estimated_budget`,
      {
        days,
        glm_amount: amount,
      },
      {
        signal,
      },
    )
    .then(({ data }) => data);
}
