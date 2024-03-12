import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { apiGetProposal } from 'api/calls/proposals';
import { QUERY_KEYS } from 'api/queryKeys';
import useProjectsCid from 'hooks/subgraph/useProjectsCid';
import toastService from 'services/toastService';
import { ExtendedProposal } from 'types/extended-proposal';
import { BackendProposal } from 'types/gen/backendproposal';

import useCurrentEpoch from './useCurrentEpoch';
import useProjectsContract from './useProjectsContract';

export default function useProposalsIpfs(
  projectsAddresses?: string[],
  epoch?: number,
): { data: ExtendedProposal[]; isFetching: boolean; refetch: () => void } {
  const { t } = useTranslation('translation', { keyPrefix: 'api.errorMessage' });
  const { data: currentEpoch } = useCurrentEpoch();

  const { data: projectsCid, isFetching: isFetchingProjectsCid } = useProjectsCid(
    epoch ?? currentEpoch!,
    {
      enabled: epoch !== undefined || currentEpoch !== undefined,
    },
  );
  const { refetch } = useProjectsContract(epoch);

  const proposalsIpfsResults: UseQueryResult<BackendProposal & { ipfsGatewayUsed: string }>[] =
    useQueries({
      queries: (projectsAddresses || []).map(address => ({
        enabled: !!address && !!projectsCid && (currentEpoch !== undefined || epoch !== undefined),
        queryFn: () => apiGetProposal(`${projectsCid}/${address}`),
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
      dataTest: 'Toast--ipfsMessage',
      message: t('ipfs.message'),
      name: 'ipfsError',
      type: 'error',
    });
  }, [isAnyError, t]);

  const isProposalsIpfsResultsFetching =
    isFetchingProjectsCid ||
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
      address: projectsAddresses![index],
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
