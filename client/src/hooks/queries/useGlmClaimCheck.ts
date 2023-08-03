import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetGlmClaimCheck } from 'api/calls/glmClaim';
import { QUERY_KEYS } from 'api/queryKeys';

export type Response = {
  address: string;
  value: BigNumber;
};

export default function useGlmClaimCheck(isOnboardingDone: boolean): UseQueryResult<Response> {
  const { address } = useAccount();

  return useQuery(QUERY_KEYS.glmClaimCheck, () => apiGetGlmClaimCheck(address! as string), {
    // When onboarding is done this query should not fire at all.
    enabled: !!address && !isOnboardingDone,
    /**
     * When an error is returned, it's an indication user is not eligible to claim.
     * No point in retrying.
     */
    retry: false,
    select: response => ({
      address: address as string,
      value: parseUnits(response.claimable, 'wei'),
    }),
  });
}
