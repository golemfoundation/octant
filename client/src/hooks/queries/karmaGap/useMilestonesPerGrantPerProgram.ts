import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetGrantsPerProgram, GrantPerProgram } from 'api/calls/karmaGap';
import { QUERY_KEYS } from 'api/queryKeys';
import { PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING } from 'constants/karmaGap';

export default function useMilestonesPerGrantPerProgram(
  epoch: number,
  projectAddress: string,
): UseQueryResult<GrantPerProgram | undefined, unknown> {
  const programId: string = PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING[epoch];
  const projectAddressToLowerCase = projectAddress.toLowerCase();

  return useQuery({
    queryFn: () => apiGetGrantsPerProgram(programId),
    queryKey: QUERY_KEYS.karmaGapMilestonesPerProjectPerGrantPerProgram(programId, projectAddress),
    select: response => {
      /**
       * In Cypress, when addresses & epoch number overlap with production environment,
       * we can actually fetch the milestones. They are not set up by us, but by projects,
       * creating uncontrolled environment tests are running in.
       *
       * Hence, always return [].
       */
      if (window.Cypress) {
        return undefined;
      }
      return response.data.find(
        element =>
          element.externalAddresses?.octant?.toLowerCase() === projectAddressToLowerCase ||
          element.project.recipient.toLowerCase() === projectAddressToLowerCase ||
          element.project.details.recipient.toLowerCase() === projectAddressToLowerCase,
      );
    },
  });
}
