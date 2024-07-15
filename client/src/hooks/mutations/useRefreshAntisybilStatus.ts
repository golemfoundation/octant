import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';

import { apiPutAntisybilStatus } from 'api/calls/antisybilStatus';

export default function useRefreshAntisybilStatus(
  options?: UseMutationOptions<any, unknown, any>,
): UseMutationResult<any, unknown, string> {
  return useMutation({
    /**
     * Trick from here:
     * => https://github.com/TanStack/query/discussions/3441#discussioncomment-2437742
     * And here:
     * => https://github.com/TanStack/query/discussions/3441#discussioncomment-8874713
     * => https://github.com/TanStack/query/discussions/3441#discussioncomment-8879944
     */
    meta: {
      shouldGlobalErrorBeIgnored: true,
    },
    mutationFn: (address: string) => apiPutAntisybilStatus(address),
    ...options,
  });
}
