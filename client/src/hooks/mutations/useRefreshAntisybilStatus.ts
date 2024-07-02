import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';

import { apiPutAntisybilStatus } from 'api/calls/antisybilStatus';

export default function useRefreshAntisybilStatus(
  address: string,
  options?: UseMutationOptions<any, unknown, any>,
): UseMutationResult<any, unknown, string> {
  return useMutation({
    mutationFn: async () => apiPutAntisybilStatus(address!),
    ...options,
  });
}
