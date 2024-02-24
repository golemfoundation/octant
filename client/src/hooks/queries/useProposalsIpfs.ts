import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { apiGetProposal } from 'api/calls/proposals';
import { QUERY_KEYS } from 'api/queryKeys';
import useProposalsCid from 'hooks/subgraph/useProposalsCid';
import toastService from 'services/toastService';
import { ExtendedProposal } from 'types/extended-proposal';
import { BackendProposal } from 'types/gen/backendproposal';

import useCurrentEpoch from './useCurrentEpoch';
import useProposalsContract from './useProposalsContract';

export default function useProposalsIpfs(
  proposalsAddresses?: string[],
  epoch?: number,
): { data: ExtendedProposal[]; isFetching: boolean; refetch: () => void } {
  const { t } = useTranslation('translation', { keyPrefix: 'api.errorMessage' });
  const { data: currentEpoch } = useCurrentEpoch();

  const { data: proposalsCid, isFetching: isFetchingProposalsCid } = useProposalsCid(
    epoch ?? currentEpoch!,
    {
      enabled: epoch !== undefined || currentEpoch !== undefined,
    },
  );
  const { refetch } = useProposalsContract(epoch);

  const proposalsIpfsResults: UseQueryResult<BackendProposal & { ipfsGatewayUsed: string }>[] =
    useQueries({
      queries: (proposalsAddresses || []).map(address => ({
        enabled: !!address && !!proposalsCid && (currentEpoch !== undefined || epoch !== undefined),
        queryFn: () => apiGetProposal(`${proposalsCid}/${address}`),
        queryKey: QUERY_KEYS.proposalsIpfsResults(address, epoch ?? currentEpoch!),
        retry: false,
      })),
    });

  const isAnyError = proposalsIpfsResults.some(element => element.isError);
  useEffect(() => {
    if (!isAnyError) {
      return;
    }
    toastService.showToast({
      message: t('ipfs.message'),
      name: 'ipfsError',
      type: 'error',
    });
  }, [isAnyError, t]);

  const isProposalsIpfsResultsFetching =
    isFetchingProposalsCid ||
    proposalsIpfsResults.length === 0 ||
    proposalsIpfsResults.some(({ isFetching }) => isFetching);

  if (isProposalsIpfsResultsFetching) {
    return {
      data: [],
      isFetching: isProposalsIpfsResultsFetching,
      refetch,
    };
  }

  const proposalsIpfsResultsWithAddresses = proposalsIpfsResults.map<ExtendedProposal>(
    (proposal, index) => ({
      address: proposalsAddresses![index],
      isLoadingError: proposal.isError,
      ...(proposal.data || {}),
    }),
  );

  return {
    data: proposalsIpfsResultsWithAddresses,
    isFetching: false,
    refetch,
  };
}
