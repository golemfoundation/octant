import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';

import { apiPutAntisybilStatus } from 'api/calls/antisybilStatus';

export default function useRefreshAntisybilStatus(
  options?: UseMutationOptions<any, unknown, any>,
): UseMutationResult<any, unknown, string> {
  return useMutation({
    mutationFn: (address: string) => apiPutAntisybilStatus(address),
    ...options,
  });
}
