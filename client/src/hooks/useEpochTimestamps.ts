import getEpochTimestamps, { Response } from 'utils/getEpochTimestamps';

import useDecisionWindow from './useDecisionWindow';
import useEpochDuration from './useEpochDuration';
import useStart from './useStart';

export default function useEpochTimestamps(epoch?: number): Response {
  const { data: decisionWindowDuration } = useDecisionWindow();
  const { data: epochDuration } = useEpochDuration();
  const { data: startTimestamp } = useStart();

  return getEpochTimestamps({
    decisionWindowDuration,
    epoch,
    epochDuration,
    startTimestamp,
  });
}
