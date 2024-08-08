import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { apiGetProjectIpfsData } from 'api/calls/projects';
import { QUERY_KEYS } from 'api/queryKeys';
import toastService from 'services/toastService';
import { ExtendedProject } from 'types/extended-project';
import { BackendProposal } from 'types/gen/backendproposal';

import useCurrentEpoch from './useCurrentEpoch';
import useProjectsEpoch from './useProjectsEpoch';

export default function useProjectsIpfs(
  projectsAddresses?: string[],
  epoch?: number,
  isEnabled?: boolean,
): { data: ExtendedProject[]; isAnyIpfsError: boolean; isFetching: boolean; refetch: () => void } {
  const { t } = useTranslation('translation', { keyPrefix: 'api.errorMessage' });
  const { data: currentEpoch } = useCurrentEpoch();
  const {
    data: projectsEpoch,
    refetch,
    isFetching: isFetchingProjectsEpoch,
  } = useProjectsEpoch(epoch, { enabled: isEnabled });

  const projectsIpfsResults: UseQueryResult<BackendProposal & { ipfsGatewayUsed: string }>[] =
    useQueries({
      queries: (projectsAddresses || []).map(address => ({
        enabled:
          !!address && !!projectsEpoch && (currentEpoch !== undefined || epoch !== undefined),
        queryFn: () => apiGetProjectIpfsData(`${projectsEpoch?.projectsCid}/${address}`),
        queryKey: QUERY_KEYS.projectsIpfsResults(address, epoch ?? currentEpoch!),
        retry: false,
      })),
    });

  const isAnyIpfsError = projectsIpfsResults.some(element => element.isError);
  useEffect(() => {
    if (!isAnyIpfsError) {
      return;
    }
    toastService.showToast({
      dataTest: 'Toast--ipfsMessage',
      message: t('ipfs.message'),
      name: 'ipfsError',
      type: 'error',
    });
  }, [isAnyIpfsError, t]);

  const isProjectsIpfsResultsFetching =
    isFetchingProjectsEpoch ||
    projectsIpfsResults.length === 0 ||
    projectsIpfsResults.some(({ isFetching }) => isFetching);

  if (isProjectsIpfsResultsFetching) {
    return {
      data: [],
      isAnyIpfsError,
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
    isAnyIpfsError,
    isFetching: false,
    refetch,
  };
}
