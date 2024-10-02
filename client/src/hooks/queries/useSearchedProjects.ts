import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetProjectsDetails, ProjectsDetails as ApiProjectsDetails } from 'api/calls/projects';
import { QUERY_KEYS } from 'api/queryKeys';
import { ProjectsDetailsSearchParameters } from 'views/ProjectsView/types';

type ProjectsDetails = ApiProjectsDetails['projectsDetails'];

export default function useSearchedProjects(
  projectsDetailsSearchParameters: ProjectsDetailsSearchParameters | undefined,
): UseQueryResult<ProjectsDetails> {
  return useQuery({
    enabled:
      !!projectsDetailsSearchParameters &&
      ((projectsDetailsSearchParameters.epochs &&
        projectsDetailsSearchParameters.epochs.length > 0) ||
        (projectsDetailsSearchParameters.searchPhrases &&
          projectsDetailsSearchParameters.searchPhrases?.length > 0)),
    queryFn: () =>
      apiGetProjectsDetails(
        projectsDetailsSearchParameters!.epochs!.map(String).toString(),
        projectsDetailsSearchParameters!.searchPhrases!.join(),
      ),
    // No point in strigifying params, they will just flood the memory.
    queryKey: QUERY_KEYS.searchResults,
    select: data => data.projectsDetails,
  });
}
