import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiGetGlmClaimCheck } from 'api/calls/glmClaim';
import { QUERY_KEYS } from 'api/queryKeys';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

export type Response = {
  address: string;
  value: bigint;
};

export default function useGlmClaimCheck(isOnboardingDone: boolean): UseQueryResult<Response> {
  const { address } = useAccount();

  return useQuery({
    // When onboarding is done this query should not fire at all.
    enabled: !!address && !isOnboardingDone,
    queryFn: () => apiGetGlmClaimCheck(address! as string),
    queryKey: QUERY_KEYS.glmClaimCheck,
    /**
     * When an error is returned, it's an indication user is not eligible to claim.
     * No point in retrying.
     */
    retry: false,
    select: response => ({
      address: address as string,
      value: parseUnitsBigInt(response.claimable, 'wei'),
    }),
  });
}
