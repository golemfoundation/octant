import getEpochTimestamps, { Response } from 'utils/getEpochTimestamps';

import useDecisionWindow from './queries/useDecisionWindow';
import useEpochDuration from './queries/useEpochDuration';
import useStart from './queries/useStart';

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
