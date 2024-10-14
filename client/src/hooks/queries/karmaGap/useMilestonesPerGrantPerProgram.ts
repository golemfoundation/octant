import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetGrantsPerProgram } from 'api/calls/karmaGap';
import { QUERY_KEYS } from 'api/queryKeys';
import { PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING } from 'constants/karmaGap';

export default function useMilestonesPerGrantPerProgram(
  epoch: number,
  projectAddress: string,
): UseQueryResult<any, unknown> {
  const programId: string = PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING[epoch];
  // eslint-disable-next-line no-console
  console.log({ projectAddress });

  return useQuery({
    queryFn: () => apiGetGrantsPerProgram(programId),
    queryKey: QUERY_KEYS.karmaGapGrantsPerProgram(programId),
    select: response => {
      // eslint-disable-next-line no-console
      console.log({ response });
      const projectAddressToLowerCase = projectAddress.toLowerCase();
      return response.data.find(element => {
        // eslint-disable-next-line
        console.log(element.project.recipient, projectAddressToLowerCase);
        return (
          element.project.externalAddresses?.octant.toLowerCase() === projectAddressToLowerCase ||
          element.project.recipient.toLowerCase() === projectAddressToLowerCase
        );
      });
    },
  });
}
