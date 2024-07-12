import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';

import { apiGetDelegationCheck, Response } from 'api/calls/checkDelegation';

export default function useCheckDelegation(
  options?: UseMutationOptions<Response, unknown, string[]>,
): UseMutationResult<Response, unknown, string[]> {
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
    mutationFn: async addresses => apiGetDelegationCheck(addresses),
    ...options,
  });
}
