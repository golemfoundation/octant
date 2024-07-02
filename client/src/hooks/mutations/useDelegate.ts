import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';

import { apiPostDelegate, DelegateProps, Response } from 'api/calls/delegate';

export default function useDelegate(
  options?: UseMutationOptions<Response, unknown, DelegateProps>,
): UseMutationResult<Response, unknown, DelegateProps> {
  return useMutation({
    mutationFn: async props => apiPostDelegate(props),
    ...options,
  });
}
