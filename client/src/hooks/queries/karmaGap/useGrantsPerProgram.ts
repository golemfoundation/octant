import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { apiGetPrograms } from 'api/calls/karmaGap';
import { QUERY_KEYS } from 'api/queryKeys';
import { PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING } from 'constants/karmaGap';

export default function useGrantsPerProgram(epoch: number): UseQueryResult<number, unknown> {
  const programId: string = PROGRAMS_IDS_TO_EPOCH_NUMBER_MAPPING[epoch];

  return useQuery({
    queryFn: () => apiGetPrograms(programId),
    queryKey: QUERY_KEYS.karmaGapGrantsPerProgram(programId),
    select: response => {
      // console.log({ response });
      return response;
    },
  });
}
