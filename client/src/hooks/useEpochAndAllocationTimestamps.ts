import getEpochAndAllocationTimestamps, { Response } from 'utils/getEpochAndAllocationTimestamps';

import useCurrentEpoch from './queries/useCurrentEpoch';
import useDecisionWindow from './queries/useDecisionWindow';
import useEpochDuration from './queries/useEpochDuration';
import useEpochProps from './queries/useEpochProps';
import useStart from './queries/useStart';

export default function useEpochAndAllocationTimestamps(): Response {
  const epochProps = useEpochProps();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: decisionWindowDuration } = useDecisionWindow();
  const { data: epochDuration } = useEpochDuration();
  const { data: startTimestamp } = useStart();

  return getEpochAndAllocationTimestamps({
    currentEpoch,
    decisionWindowDuration,
    epochDuration,
    epochProps,
    startTimestamp,
  });
}
