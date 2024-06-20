import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';

import { SignatureOpType, apiPostPendingMultisigSignatures } from 'api/calls/multisigSignatures';
import { apiGetSafeMessages } from 'api/calls/safeMessages';
import { apiPostUserTOS } from 'api/calls/userTOS';
import { QUERY_KEYS } from 'api/queryKeys';
import useIsContract from 'hooks/queries/useIsContract';

export default function useUserAcceptsTOS(
  onMultisigMessageSign?: () => void,
): UseMutationResult<any> {
  const { address } = useAccount();
  const { signMessageAsync, signMessage } = useSignMessage();
  const queryClient = useQueryClient();

  const { data: isContract } = useIsContract();

  return useMutation({
    mutationFn: async () => {
      const message = `Welcome to Octant.\nPlease click to sign in and accept the Octant Terms of Service.\n\nSigning this message will not trigger a transaction.\n\nYour address\n${address}`;

      if (isContract && !!onMultisigMessageSign) {
        const safeMessages = await apiGetSafeMessages(address!);
        signMessage({
          message,
        });

        const intervalId = setInterval(async () => {
          const nextSafeMessages = await apiGetSafeMessages(address!);

          if (nextSafeMessages.count > safeMessages.count) {
            clearInterval(intervalId);
            apiPostPendingMultisigSignatures(address!, message, SignatureOpType.TOS).then(() => {
              onMultisigMessageSign();
            });
          }
        }, 2000);

        return;
      }

      const signedMessage = await signMessageAsync({
        message,
      });

      const data = await apiPostUserTOS(address as `0x${string}`, { signature: signedMessage });
      return data;
    },

    onSuccess: data => {
      if (isContract) {
        return;
      }
      queryClient.setQueryData(QUERY_KEYS.userTOS(address!), data);
    },
  });
}
