import { UseMutationResult, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useAccount, useSignTypedData } from 'wagmi';

import { apiPostGlmClaim } from 'api/calls/glmClaim';
import networkConfig from 'constants/networkConfig';
import i18n from 'i18n';

const domain = {
  chainId: networkConfig.id,
  name: 'Octant',
  version: '1.0.0',
};

export default function useGlmClaim(
  glmClaimCheckValue: BigNumber | undefined,
  options?: UseMutationOptions<any, unknown, string>,
): UseMutationResult<any, unknown, string> {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData({
    account: address,
    domain,
    message: {
      msg: i18n.t('views.onboarding.steps.claimGlm.signMessage', {
        value: glmClaimCheckValue ? parseInt(formatUnits(glmClaimCheckValue), 10) : 0,
      }),
    },
    primaryType: 'ClaimGLMPayload',
    types: {
      ClaimGLMPayload: [{ name: 'msg', type: 'string' }],
    },
  });

  return useMutation({
    mutationFn: async () => {
      return signTypedDataAsync().then(data => apiPostGlmClaim(data));
    },
    ...options,
  });
}
