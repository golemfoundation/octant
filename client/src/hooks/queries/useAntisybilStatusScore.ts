import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetAntisybilStatus, Response } from 'api/calls/antisybilStatus';
import { QUERY_KEYS } from 'api/queryKeys';

import useUserTOS from './useUserTOS';

type AntisybilStatusScore = { isOnTimeOutList: boolean; score: number };

export default function useAntisybilStatusScore(
  address: string | undefined,
  options?: Omit<UseQueryOptions<Response, unknown, AntisybilStatusScore, any>, 'queryKey'>,
): UseQueryResult<AntisybilStatusScore, unknown> {
  const { data: isUserTOSAccepted } = useUserTOS();

  return useQuery({
    /**
     * !! required, as address: string & isUserTOSAccepted: undefined gives undefined,
     * so query is done when it shouldn't be.
     */
    //
    enabled: !!(!!address && isUserTOSAccepted),
    queryFn: () => apiGetAntisybilStatus(address!),
    queryKey: QUERY_KEYS.antisybilStatus(address!),
    refetchOnMount: true,
    retry: false,
    select: ({ score, isOnTimeOutList }) => ({
      isOnTimeOutList,
      score: Math.round(parseFloat(score)),
    }),
    ...options,
  });
}
