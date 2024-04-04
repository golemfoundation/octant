import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';

import { SignatureOpType, apiPostPendingMultisigSignatures } from 'api/calls/multisigSignatures';
import { apiPostUserTOS } from 'api/calls/userTOS';
import { QUERY_KEYS } from 'api/queryKeys';
import useIsContract from 'hooks/queries/useIsContract';

export default function useUserAcceptsTOS(): UseMutationResult<any> {
  const { address } = useAccount();
  const { signMessageAsync, signMessage } = useSignMessage();
  const queryClient = useQueryClient();

  const { data: isContract } = useIsContract();

  return useMutation({
    mutationFn: async () => {
      const message = `Welcome to Octant.\nPlease click to sign in and accept the Octant Terms of Service.\n\nSigning this message will not trigger a transaction.\n\nYour address\n${address}`;
      if (isContract) {
        signMessage({
          message,
        });
        await apiPostPendingMultisigSignatures(address!, message, SignatureOpType.TOS);
        return { accepted: false };
      }

      const signedMessages = await signMessageAsync({
        message,
      });

      const data = await apiPostUserTOS(address as `0x${string}`, { signature: signedMessages });
      return data;
    },

    onSuccess: data => {
      queryClient.setQueryData(QUERY_KEYS.userTOS(address!), data);
    },
  });
}
