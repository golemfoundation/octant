import env from 'env';
import apiService from 'services/apiService';

export type PostCalculateRewardsResponse = {
  budget: number;
};

export function apiPostCalculateRewards(
  // WEI
  amount: string,
  days: number,
): Promise<PostCalculateRewardsResponse> {
  return apiService
    .post(`${env.serverEndpoint}rewards/estimated_budget`, {
      days,
      glm_amount: amount,
    })
    .then(({ data }) => data);
}
