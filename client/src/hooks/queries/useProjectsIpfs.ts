import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { apiGetProject } from 'api/calls/projects';
import { QUERY_KEYS } from 'api/queryKeys';
import useProjectsCid from 'hooks/subgraph/useProjectsCid';
import toastService from 'services/toastService';
import { ExtendedProject } from 'types/extended-project';
import { BackendProposal } from 'types/gen/backendproposal';

import useCurrentEpoch from './useCurrentEpoch';
import useProjectsContract from './useProjectsContract';

export default function useProjectsIpfs(
  projectsAddresses?: string[],
  epoch?: number,
): { data: ExtendedProject[]; isFetching: boolean; refetch: () => void } {
  const { t } = useTranslation('translation', { keyPrefix: 'api.errorMessage' });
  const { data: currentEpoch } = useCurrentEpoch();

  const { data: projectsCid, isFetching: isFetchingProjectsCid } = useProjectsCid(
    epoch ?? currentEpoch!,
    {
      enabled: epoch !== undefined || currentEpoch !== undefined,
    },
  );
  const { refetch } = useProjectsContract(epoch);

  const projectsIpfsResults: UseQueryResult<BackendProposal & { ipfsGatewayUsed: string }>[] =
    useQueries({
      queries: (projectsAddresses || []).map(address => ({
        enabled: !!address && !!projectsCid && (currentEpoch !== undefined || epoch !== undefined),
        queryFn: () => apiGetProject(`${projectsCid}/${address}`),
        queryKey: QUERY_KEYS.projectsIpfsResults(address, epoch ?? currentEpoch!),
        retry: false,
      })),
    });

  const isAnyError = projectsIpfsResults.some(element => element.isError);
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

  const isProjectsIpfsResultsFetching =
    isFetchingProjectsCid ||
    projectsIpfsResults.length === 0 ||
    projectsIpfsResults.some(({ isFetching }) => isFetching);

  if (isProjectsIpfsResultsFetching) {
    return {
      data: [],
      isFetching: isProjectsIpfsResultsFetching,
      refetch,
    };
  }

  const projectsIpfsResultsWithAddresses = projectsIpfsResults.map<ExtendedProject>(
    (project, index) => ({
      address: projectsAddresses![index],
      isLoadingError: project.isError,
      ...(project.data || {}),
    }),
  );

  return {
    data: projectsIpfsResultsWithAddresses,
    isFetching: false,
    refetch,
  };
}
