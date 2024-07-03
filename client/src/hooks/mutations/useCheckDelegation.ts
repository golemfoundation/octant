import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';

import { apiGetDelegationCheck, Response } from 'api/calls/checkDelegation';

export default function useCheckDelegation(
  options?: UseMutationOptions<Response, unknown, string[]>,
): UseMutationResult<Response, unknown, string[]> {
  return useMutation({
    mutationFn: async addresses => apiGetDelegationCheck(addresses),
    ...options,
  });
}
