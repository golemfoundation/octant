import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';

import { apiPostUserTOS } from 'api/calls/userTOS';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useUserAcceptsTOS(): UseMutationResult<any> {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const signedMessages = await signMessageAsync({
        message: `Welcome to Octant.\nPlease click to sign in and accept the Octant Terms of Service.\n\nSigning this message will not trigger a transaction.\n\nYour address\n${address}`,
      });

      const data = await apiPostUserTOS(address as `0x${string}`, { signature: signedMessages });
      return data;
    },

    onSuccess: data => {
      queryClient.setQueryData(QUERY_KEYS.userTOS(address!), data);
    },
  });
}
