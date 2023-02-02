import getEpochAndAllocationTimestamps, { Response } from 'utils/getEpochAndAllocationTimestamps';

import useCurrentEpoch from './useCurrentEpoch';
import useDecisionWindow from './useDecisionWindow';
import useEpochDuration from './useEpochDuration';
import useStart from './useStart';

export default function useEpochAndAllocationTimestamps(): Response {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: decisionWindowDuration } = useDecisionWindow();
  const { data: epochDuration } = useEpochDuration();
  const { data: startTimestamp } = useStart();

  return getEpochAndAllocationTimestamps({
    currentEpoch,
    decisionWindowDuration,
    epochDuration,
    startTimestamp,
  });
}
