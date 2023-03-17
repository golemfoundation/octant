import { EpochProps } from 'hooks/queries/useCurrentEpochProps';

type Parameters = {
  currentEpochEnd?: number;
  currentEpochProps?: EpochProps;
};

export type Response = {
  timeCurrentAllocationEnd?: number;
  timeCurrentAllocationStart?: number;
  timeCurrentEpochEnd?: number;
  timeCurrentEpochStart?: number;
};

export default function getCurrentEpochAndAllocationTimestamps({
  currentEpochProps,
  currentEpochEnd,
}: Parameters): Response {
  if (!currentEpochProps || !currentEpochEnd) {
    return {};
  }

  const timeCurrentEpochEnd = currentEpochEnd;
  const timeCurrentEpochStart = currentEpochEnd - currentEpochProps.duration;

  const timeCurrentAllocationStart = timeCurrentEpochStart;
  const timeCurrentAllocationEnd = timeCurrentEpochStart + currentEpochProps.decisionWindow;

  return {
    timeCurrentAllocationEnd,
    timeCurrentAllocationStart,
    timeCurrentEpochEnd,
    timeCurrentEpochStart,
  };
}
