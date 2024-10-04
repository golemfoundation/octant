import { UseQueryResult, useQuery } from '@tanstack/react-query';

import {
  apiGetProjectsSearch,
  // ProjectsSearchResults as ApiProjectsSearchResults,
} from 'api/calls/projects';
import { QUERY_KEYS } from 'api/queryKeys';
import { ProjectsSearchParameters } from 'views/ProjectsView/types';

export type ProjectsSearchResults = {
  address: string;
  epoch: number;
  name: string;
}[];

export default function useSearchedProjects(
  projectsSearchParameters: ProjectsSearchParameters | undefined,
): UseQueryResult<ProjectsSearchResults, unknown> {
  return useQuery({
    enabled:
      !!projectsSearchParameters &&
      ((projectsSearchParameters.epochs && projectsSearchParameters.epochs.length > 0) ||
        (projectsSearchParameters.searchPhrases &&
          projectsSearchParameters.searchPhrases?.length > 0)),
    queryFn: () =>
      apiGetProjectsSearch(
        projectsSearchParameters!.epochs!.map(String).toString(),
        projectsSearchParameters!.searchPhrases!.join(),
      ),
    // No point in strigifying params, they will just flood the memory.
    queryKey: QUERY_KEYS.searchResults,
    select: data =>
      data.projectsDetails.map(element => ({
        ...element,
        epoch: Number(element.epoch),
      })),
  });
}
