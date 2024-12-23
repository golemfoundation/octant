import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';

import { ApiPatronModeResponse, apiPatchPatronMode } from 'api/calls/patronMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

export default function usePatronMode(
  options?: UseMutationOptions<any, unknown, string>,
): UseMutationResult<ApiPatronModeResponse, unknown, string> {
  const { data: isPatronModeEnabled } = useIsPatronMode();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async () => {
      const signedMessages = await signMessageAsync({
        // Message needs to stay in English regardless of locale, as it's content is verified in BE.
        message: `Signing this message will ${isPatronModeEnabled ? 'disable' : 'enable'} patron mode for address ${address}.`,
      });

      const data = await apiPatchPatronMode(address!, signedMessages);
      return data;
    },
    ...options,
  });
}
