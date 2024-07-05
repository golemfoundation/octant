import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetAntisybilStatus, Response } from 'api/calls/antisybilStatus';
import { QUERY_KEYS } from 'api/queryKeys';

import useUserTOS from './useUserTOS';

export default function useAntisybilStatusScore(
  address: string,
  options?: Omit<UseQueryOptions<Response, unknown, number, any>, 'queryKey'>,
): UseQueryResult<number, unknown> {
  const { data: isUserTOSAccepted } = useUserTOS();

  return useQuery({
    enabled: !!address && isUserTOSAccepted,
    queryFn: () => apiGetAntisybilStatus(address!),
    queryKey: QUERY_KEYS.antisybilStatus(address!),
    refetchOnMount: true,
    select: response => Math.round(parseFloat(response.score)),
    ...options,
  });
}
