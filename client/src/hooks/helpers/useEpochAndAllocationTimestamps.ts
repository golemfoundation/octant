import useCurrentEpochEnd from 'hooks/queries/useCurrentEpochEnd';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import getCurrentEpochAndAllocationTimestamps, {
  Response,
} from 'utils/getCurrentEpochAndAllocationTimestamps';

export default function useEpochAndAllocationTimestamps(): Response {
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { data: currentEpochEnd } = useCurrentEpochEnd();

  return getCurrentEpochAndAllocationTimestamps({
    currentEpochEnd,
    currentEpochProps,
  });
}
