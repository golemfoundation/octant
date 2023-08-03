import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useAccount } from 'wagmi';

import { apiGetGlmClaimCheck, GetGlmClaimCheckResponse } from 'api/calls/glmClaim';
import { QUERY_KEYS } from 'api/queryKeys';

export type Response = {
  address: string;
  value: BigNumber;
};

export default function useGlmClaimCheck(
  options?: UseQueryOptions<GetGlmClaimCheckResponse, unknown, any, any>,
): UseQueryResult<Response> {
  const { address } = useAccount();

  return useQuery(QUERY_KEYS.glmClaimCheck, () => apiGetGlmClaimCheck(address!), {
    enabled: !!address,
    /**
     * When an error is returned, it's an indication user is not eligible to claim.
     * No point in retrying.
     */
    retry: false,
    select: response => ({
      address,
      value: parseUnits(response.claimable, 'wei'),
    }),
    ...options,
  });
}
