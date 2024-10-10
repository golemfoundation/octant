import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetPrograms } from 'api/calls/karmaGap';
import { QUERY_KEYS } from 'api/queryKeys';
import { PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING } from 'constants/karmaGap';

export default function useMilestonesPerGrantPerProgram(
  epoch: number,
  projectAddress: string,
): UseQueryResult<number, unknown> {
  const programId: string = PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING[epoch];
  // eslint-disable-next-line no-console
  console.log({ projectAddress });

  return useQuery({
    queryFn: () => apiGetPrograms(programId),
    queryKey: QUERY_KEYS.karmaGapGrantsPerProgram(programId),
    select: response => {
      // eslint-disable-next-line no-console
      console.log({ response });
      return response.data.find(element => element.details.recipient === projectAddress).milestones;
    },
  });
}
