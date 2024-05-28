import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';

import { ApiPatronModeResponse, apiPatchPatronMode } from 'api/calls/patronMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

export default function usePatronMode(
  options?: UseMutationOptions<any, unknown, string>,
): UseMutationResult<ApiPatronModeResponse, unknown, string> {
  const { t } = useTranslation('translation', { keyPrefix: 'components.settings.patronMode' });
  const { data: isPatronModeEnabled } = useIsPatronMode();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async () => {
      const signedMessages = await signMessageAsync({
        message: t('patronModeSignatureMessage', {
          address,
          state: isPatronModeEnabled ? 'disable' : 'enable',
        }),
      });

      const data = await apiPatchPatronMode(address!, signedMessages);
      return data;
    },
    ...options,
  });
}
