import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { apiPutAntisybilStatus } from 'api/calls/antisybilStatus';

export default function useRefreshAntisybilStatus(
  options?: UseMutationOptions<any, unknown, any>,
): UseMutationResult<any, unknown, string> {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async () => apiPutAntisybilStatus(address!),
    ...options,
  });
}
