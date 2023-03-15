import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDecisionWindow from 'hooks/queries/useDecisionWindow';
import useEpochDuration from 'hooks/queries/useEpochDuration';
import useEpochProps from 'hooks/queries/useEpochProps';
import useStart from 'hooks/queries/useStart';
import getCurrentEpochAndAllocationTimestamps, {
  Response,
} from 'utils/getCurrentEpochAndAllocationTimestamps';

export default function useEpochAndAllocationTimestamps(): Response {
  const epochProps = useEpochProps();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: decisionWindowDuration } = useDecisionWindow();
  const { data: epochDuration } = useEpochDuration();
  const { data: startTimestamp } = useStart();

  return getCurrentEpochAndAllocationTimestamps({
    currentEpoch,
    decisionWindowDuration,
    epochDuration,
    epochProps,
    startTimestamp,
  });
}
