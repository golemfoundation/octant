import { UseQueryResult, useQuery } from '@tanstack/react-query';
import uniqWith from 'lodash/uniqWith';

import { apiGetProjectsSearch } from 'api/calls/projects';
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
    select: data => {
      const dataWithEpochNumber = data.projectsDetails.map(element => ({
        ...element,
        epoch: Number(element.epoch),
      }));

      /**
       * Because of the bug, BE sometimes returns the same
       * name, address & epoch combination multiple times.
       *
       * Please check e.g.
       * GET https://backend.mainnet.octant.app/projects/details?epochs=1,2,3,4,5,6,7&searchPhrases=Open,Source,Observer
       *
       * Hence the requirement to check uniqueness.
       *
       * More context: https://chat.wildland.dev/wildland/pl/gghcfgjndjyjieei8axn3opdeh
       */
      return uniqWith(dataWithEpochNumber, (elementA, elementB) => {
        return elementA.address === elementB.address && elementA.epoch === elementB.epoch;
      });
    },
  });
}
