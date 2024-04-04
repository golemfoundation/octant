import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import {
  SignatureOpType,
  apiGetPendingMultisigSignatures,
  PendingMultisigSignatures,
} from 'api/calls/multisigSignatures';
import { QUERY_KEYS } from 'api/queryKeys';

import useIsContract from './useIsContract';
import useUserTOS from './useUserTOS';

export default function usePendingMultisigSignatures(
  signatureOpType: SignatureOpType,
  options?: UseQueryOptions<PendingMultisigSignatures, unknown, number, any>,
): UseQueryResult<number, unknown> {
  const { address } = useAccount();
  const { data: isContract } = useIsContract();
  const { data: isUserTOSAccepted } = useUserTOS();

  return useQuery({
    enabled: !!address && !!isContract && !isUserTOSAccepted,
    queryFn: () => apiGetPendingMultisigSignatures(address!, signatureOpType),
    queryKey: QUERY_KEYS.pendingMultisigSignatures(address!, signatureOpType),
    ...options,
  });
}
