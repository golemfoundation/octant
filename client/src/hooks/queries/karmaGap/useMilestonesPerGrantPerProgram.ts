import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetGrantsPerProgram } from 'api/calls/karmaGap';
import { QUERY_KEYS } from 'api/queryKeys';
import { PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING } from 'constants/karmaGap';

export default function useMilestonesPerGrantPerProgram(
  epoch: number,
  projectAddress: string,
): UseQueryResult<any, unknown> {
  const programId: string = PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING[epoch];
  const projectAddressToLowerCase = projectAddress.toLowerCase();

  return useQuery({
    queryFn: () => apiGetGrantsPerProgram(programId),
    queryKey: QUERY_KEYS.karmaGapMilestonesPerProjectPerGrantPerProgram(programId, projectAddress),
    select: response =>
      response.data.find(
        element =>
          element.project.externalAddresses?.octant.toLowerCase() === projectAddressToLowerCase ||
          element.project.recipient.toLowerCase() === projectAddressToLowerCase,
      ),
  });
}
